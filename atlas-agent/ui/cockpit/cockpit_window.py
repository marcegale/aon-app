from __future__ import annotations

import json
import logging
import sys
import threading
import time
from pathlib import Path
from typing import Any, Callable

import webview

_WINDOW_W = 380
_WINDOW_H = 580


def _frontend_path() -> str:
    if getattr(sys, "frozen", False):
        base = Path(sys._MEIPASS) / "ui" / "cockpit"
    else:
        base = Path(__file__).resolve().parent
    return str(base / "frontend" / "index.html")


import os as _os


def _build_allowed_prefixes(*base_urls: str) -> tuple[str, ...]:
    """Return normalised (trailing-slash) URL prefix tuple, deduped, non-empty."""
    seen: list[str] = []
    for u in base_urls:
        norm = u.rstrip("/") + "/"
        if norm != "/" and norm not in seen:
            seen.append(norm)
    return tuple(seen)


_ALLOWED_URL_PREFIXES = _build_allowed_prefixes(
    "https://app.aigency.com",
    _os.getenv("NEXT_PUBLIC_APP_URL", ""),
    _os.getenv("BACKEND_URL", ""),
)


class _CockpitAPI:
    """Python object exposed to cockpit.js via pywebview js_api."""

    def __init__(self, cockpit: "CockpitWindow") -> None:
        self._cockpit = cockpit

    def close_cockpit(self):
        self._cockpit.close()

    def send_message(self, prompt: str):
        """Called from JS when user submits. Runs input callback in daemon thread."""
        if not isinstance(prompt, str):
            return
        cb = self._cockpit._input_callback
        if cb is None:
            return
        threading.Thread(target=cb, args=(prompt,), daemon=True).start()

    def approve_action(self, action_id: str):
        """Called from JS when user clicks Permitir."""
        cb = self._cockpit._approve_callback
        if cb is None:
            return
        threading.Thread(target=cb, args=(action_id,), daemon=True).start()

    def cancel_action(self, action_id: str):
        """Called from JS when user clicks Cancelar or Cerrar."""
        cb = self._cockpit._cancel_callback
        if cb is None:
            return
        threading.Thread(target=cb, args=(action_id,), daemon=True).start()

    def open_external_url(self, url: str) -> None:
        """Opens a URL in the system browser. Restricted to app.aigency.com only."""
        import webbrowser
        if isinstance(url, str) and any(url.startswith(p) for p in _ALLOWED_URL_PREFIXES):
            webbrowser.open(url)
        else:
            logging.warning("[cockpit] open_external_url blocked: not in allowed domains")

    def retry_registration(self) -> dict:
        """Called from JS when the user clicks the retry button."""
        cb = self._cockpit._registration_retry_callback
        if cb is None:
            return {"ok": False, "error": "No retry callback registered"}
        with self._cockpit._retry_lock:
            if self._cockpit._retry_in_progress:
                return {"ok": False, "error": "Retry already in progress"}
            self._cockpit._retry_in_progress = True

        def _run() -> None:
            try:
                cb()
            finally:
                self._cockpit._retry_in_progress = False

        try:
            threading.Thread(target=_run, daemon=True).start()
        except Exception:
            self._cockpit._retry_in_progress = False
            return {"ok": False, "error": "Failed to start retry thread"}
        return {"ok": True}


class CockpitWindow:
    """Optional expanded Atlas panel.

    Starts hidden. open()/close() toggle visibility.
    All Python→JS calls go through _eval().
    """

    def __init__(self) -> None:
        self._win: webview.Window | None = None
        self._api = _CockpitAPI(self)
        self._visible = False
        self._ready = False
        self._input_callback: Callable[[str], None] | None = None
        self._approve_callback: Callable[[str], None] | None = None
        self._cancel_callback: Callable[[str], None] | None = None
        self._registration_retry_callback: Callable[[], None] | None = None
        self._retry_in_progress: bool = False
        self._retry_lock: threading.Lock = threading.Lock()
        self._permission_pending = False
        self._pending_reg: Any = None
        self._pending_reg_status: str | None = None

    def set_input_callback(self, fn: Callable[[str], None]) -> None:
        self._input_callback = fn

    def set_approve_callback(self, fn: Callable[[str], None]) -> None:
        self._approve_callback = fn

    def set_cancel_callback(self, fn: Callable[[str], None]) -> None:
        self._cancel_callback = fn

    def set_registration_retry_callback(self, fn: Callable[[], None]) -> None:
        self._registration_retry_callback = fn

    def start(self) -> None:
        self._win = webview.create_window(
            title="Atlas — Cockpit",
            url=_frontend_path(),
            width=_WINDOW_W,
            height=_WINDOW_H,
            resizable=True,
            frameless=True,
            transparent=False,
            on_top=False,
            background_color="#0d1117",
            js_api=self._api,
            hidden=True,
        )
        self._win.events.loaded += self._on_loaded
        logging.info("[cockpit] window created (hidden)")

    def _on_loaded(self) -> None:
        self._ready = True
        logging.info("[cockpit] frontend loaded")
        if self._pending_reg is not None:
            self._emit_registration_card()
        if self._pending_reg_status is not None:
            safe = json.dumps(self._pending_reg_status)
            self._eval(f"window.updateRegistrationStatus({safe})")

    def open(self) -> None:
        if self._win is None:
            return
        self._win.show()
        self._visible = True
        self._eval("setTimeout(window._focusInput, 150)")
        logging.info("[cockpit] opened")

    def close(self) -> None:
        if self._win is None:
            return
        # Unblock any pending gate.wait() when user closes the cockpit
        if self._permission_pending:
            cb = self._cancel_callback
            if cb:
                threading.Thread(target=cb, args=("__closed__",), daemon=True).start()
        self._win.hide()
        self._visible = False
        logging.info("[cockpit] closed")

    def is_visible(self) -> bool:
        return self._visible

    def _eval(self, js: str) -> None:
        if self._win is None or not self._ready:
            return
        try:
            self._win.evaluate_js(js)
        except Exception as exc:
            logging.warning("[cockpit] evaluate_js error: %s", exc)

    def send_event(self, event_name: str, payload: Any = None) -> None:
        body = ""
        if isinstance(payload, dict):
            frm = payload.get("from", "")
            to  = payload.get("to", "")
            if frm and to:
                body = f"{frm} → {to}"
            else:
                body = json.dumps(payload, ensure_ascii=False)
        elif payload is not None:
            body = str(payload)

        ts = time.strftime("%H:%M:%S")
        evt_js = json.dumps({"name": event_name, "body": body, "time": ts})
        self._eval(f"window.appendEvent({evt_js})")

        if event_name == "state_changed" and isinstance(payload, dict):
            to = payload.get("to", "")
            if to:
                self._eval(f"window.setCockpitState('{to}')")

    def show_user_message(self, text: str) -> None:
        safe = json.dumps(text)
        self._eval(f"window.showUserMessage({safe})")

    def show_atlas_response(self, text: str, mode: str = "", is_error: bool = False) -> None:
        safe_text = json.dumps(text)
        safe_mode = json.dumps(mode)
        safe_err  = "true" if is_error else "false"
        self._eval(f"window.showAtlasResponse({safe_text}, {safe_mode}, {safe_err})")

    def set_thinking(self, active: bool) -> None:
        flag = "true" if active else "false"
        self._eval(f"window.setThinking({flag})")

    def show_permission_card(self, action_dict: dict, destructive_blocked: bool = False) -> None:
        self._permission_pending = True
        safe_action = json.dumps(action_dict, ensure_ascii=False)
        safe_blocked = "true" if destructive_blocked else "false"
        self._eval(f"window.showPermissionCard({safe_action}, {safe_blocked})")

    def hide_permission_card(self) -> None:
        self._permission_pending = False
        self._eval("window.hidePermissionCard()")

    def show_registration_card(self, reg: Any) -> None:
        self._pending_reg = reg
        if self._ready:
            self._emit_registration_card()

    def _emit_registration_card(self) -> None:
        import dataclasses
        try:
            d = dataclasses.asdict(self._pending_reg)
        except TypeError:
            d = self._pending_reg if isinstance(self._pending_reg, dict) else {}
        safe = json.dumps(d, ensure_ascii=False)
        self._eval(f"window.showRegistrationCard({safe})")
        if not self._visible:
            self.open()

    def hide_registration_card(self) -> None:
        self._eval("window.hideRegistrationCard()")

    def show_registration_status(self, status: str) -> None:
        self._pending_reg_status = status
        safe = json.dumps(status)
        self._eval(f"window.updateRegistrationStatus({safe})")

    def show_registration_success(self) -> None:
        self._eval("window.showRegistrationSuccess()")

    def show_registration_failed(self, code: str, message: str) -> None:
        safe = json.dumps({"code": code, "message": message}, ensure_ascii=False)
        self._eval(f"window.showRegistrationFailed({safe})")

    def show_action_result(self, result: Any) -> None:
        import dataclasses
        try:
            d = dataclasses.asdict(result)
        except TypeError:
            d = result if isinstance(result, dict) else {}
        safe = json.dumps(d, ensure_ascii=False)
        self._eval(f"window.showActionResult({safe})")

    def show_tool_result(self, output: str, ok: bool) -> None:
        # Deprecated legacy alias — wraps output+ok into showActionResult shape
        safe_output = json.dumps(output, ensure_ascii=False)
        safe_ok = "true" if ok else "false"
        self._eval(f"window.showToolResult({safe_output}, {safe_ok})")
