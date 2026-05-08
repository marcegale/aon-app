import json
import logging
import sys
import time
from pathlib import Path
from typing import Any

import webview

_WINDOW_W = 380
_WINDOW_H = 520


def _frontend_path() -> str:
    if getattr(sys, "frozen", False):
        base = Path(sys.executable).resolve().parent
    else:
        base = Path(__file__).resolve().parent
    return str(base / "frontend" / "index.html")


class _CockpitAPI:
    """Python object exposed to cockpit.js via pywebview js_api."""

    def __init__(self, cockpit: "CockpitWindow") -> None:
        self._cockpit = cockpit

    def close_cockpit(self):
        self._cockpit.close()


class CockpitWindow:
    """Optional expanded Atlas panel.

    Starts hidden. open()/close() toggle visibility.
    send_event() pushes entries into the JS event log.
    """

    def __init__(self) -> None:
        self._win: webview.Window | None = None
        self._api = _CockpitAPI(self)
        self._visible = False
        self._ready = False

    def start(self) -> None:
        """Create the pywebview window hidden (does not start event loop)."""
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

    def open(self) -> None:
        if self._win is None:
            return
        self._win.show()
        self._visible = True
        logging.info("[cockpit] opened")

    def close(self) -> None:
        if self._win is None:
            return
        self._win.hide()
        self._visible = False
        logging.info("[cockpit] closed")

    def is_visible(self) -> bool:
        return self._visible

    def send_event(self, event_name: str, payload: Any = None) -> None:
        if self._win is None or not self._ready:
            return
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
        try:
            self._win.evaluate_js(f"window.appendEvent({evt_js})")
        except Exception as exc:
            logging.warning("[cockpit] send_event error: %s", exc)

        # keep state badge in sync when it's a state_changed event
        if event_name == "state_changed" and isinstance(payload, dict):
            to = payload.get("to", "")
            if to:
                try:
                    self._win.evaluate_js(f"window.setCockpitState('{to}')")
                except Exception:
                    pass
