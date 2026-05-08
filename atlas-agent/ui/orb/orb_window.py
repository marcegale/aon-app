import logging
import sys
from pathlib import Path

import webview

_WINDOW_W = 120
_WINDOW_H = 120


def _frontend_path() -> str:
    if getattr(sys, "frozen", False):
        base = Path(sys.executable).resolve().parent
    else:
        base = Path(__file__).resolve().parent
    return str(base / "frontend" / "index.html")


def _initial_position():
    try:
        import ctypes
        user32 = ctypes.windll.user32
        sw = user32.GetSystemMetrics(0)
        sh = user32.GetSystemMetrics(1)
        x = sw - _WINDOW_W - 24
        y = sh - _WINDOW_H - 60
        return x, y
    except Exception:
        return 100, 100


class _OrbAPI:
    """Python object exposed to orb.js via pywebview js_api."""

    def __init__(self, orb: "OrbWindow") -> None:
        self._orb = orb

    def move_window(self, dx: float, dy: float):
        try:
            win = self._orb._win
            if win is None:
                return [0, 0]
            # pywebview 6.x: window position not directly readable;
            # track internally and use win32 fallback when needed
            x = self._orb._x + int(dx)
            y = self._orb._y + int(dy)
            self._orb._x = x
            self._orb._y = y
            win.move(x, y)
            return [x, y]
        except Exception as exc:
            logging.warning("[orb] move_window error: %s", exc)
            return [0, 0]

    def toggle_cockpit(self):
        try:
            self._orb._broker.emit("cockpit_open", None)
        except Exception as exc:
            logging.warning("[orb] toggle_cockpit error: %s", exc)


class OrbWindow:
    """Primary Atlas interface — a floating transparent orb.

    Always-on-top, frameless, transparent background.
    Must be created before webview.start() is called.
    """

    def __init__(self, broker) -> None:
        self._broker = broker
        self._win: webview.Window | None = None
        self._api = _OrbAPI(self)
        x, y = _initial_position()
        self._x = x
        self._y = y

    def start(self) -> None:
        """Create the pywebview window (does not start the event loop)."""
        self._win = webview.create_window(
            title="Atlas",
            url=_frontend_path(),
            width=_WINDOW_W,
            height=_WINDOW_H,
            x=self._x,
            y=self._y,
            resizable=False,
            frameless=True,
            transparent=True,
            on_top=True,
            background_color="#000000",
            js_api=self._api,
            shadow=False,
            easy_drag=False,
        )
        logging.info("[orb] window created at (%d, %d)", self._x, self._y)

    def set_state(self, orb_state: str) -> None:
        if self._win is None:
            return
        try:
            self._win.evaluate_js(f"window.setOrbState('{orb_state}')")
            logging.info("[orb] set_state(%s)", orb_state)
        except Exception as exc:
            logging.warning("[orb] set_state error: %s", exc)

    def stop(self) -> None:
        if self._win is not None:
            try:
                self._win.destroy()
            except Exception:
                pass
        logging.info("[orb] stopped")
