import ctypes
import logging
import sys
from pathlib import Path

import webview

_WINDOW_W = 120
_WINDOW_H = 120

# win32 layered-window constants
_GWL_EXSTYLE   = -20
_WS_EX_LAYERED = 0x00080000
_LWA_COLORKEY  = 0x00000001
_COLORKEY      = 0x00000000   # pure black — keyed out → transparent


def _frontend_path() -> str:
    if getattr(sys, "frozen", False):
        base = Path(sys.executable).resolve().parent
    else:
        base = Path(__file__).resolve().parent
    return str(base / "frontend" / "index.html")


def _initial_position():
    try:
        user32 = ctypes.windll.user32
        sw = user32.GetSystemMetrics(0)
        sh = user32.GetSystemMetrics(1)
        x = sw - _WINDOW_W - 24
        y = sh - _WINDOW_H - 60
        return x, y
    except Exception:
        return 100, 100


def _apply_colorkey(title: str) -> bool:
    """Make all pure-black pixels invisible via win32 layered window."""
    try:
        user32 = ctypes.windll.user32
        hwnd = user32.FindWindowW(None, title)
        if not hwnd:
            logging.warning("[orb] FindWindowW(%r) returned 0 — transparency not applied", title)
            return False
        ex = user32.GetWindowLongW(hwnd, _GWL_EXSTYLE)
        user32.SetWindowLongW(hwnd, _GWL_EXSTYLE, ex | _WS_EX_LAYERED)
        user32.SetLayeredWindowAttributes(hwnd, _COLORKEY, 0, _LWA_COLORKEY)
        logging.info("[orb] LWA_COLORKEY applied — hwnd=0x%x", hwnd)
        return True
    except Exception as exc:
        logging.warning("[orb] colorkey error: %s", exc)
        return False


class _OrbAPI:
    """Python object exposed to orb.js via pywebview js_api."""

    def __init__(self, orb: "OrbWindow") -> None:
        self._orb = orb

    def move_window(self, dx: float, dy: float):
        try:
            win = self._orb._win
            if win is None:
                return [0, 0]
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

    Always-on-top, frameless. Transparency is achieved via win32 LWA_COLORKEY
    (pure black = invisible) rather than pywebview's broken transparent=True flag,
    which never enables AllowsTransparency on the underlying WinForms Form.
    Call apply_transparency() once from the on_started background thread.
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
            transparent=False,        # LWA_COLORKEY handles transparency instead
            on_top=True,
            background_color="#000000",  # black = colorkey = invisible
            js_api=self._api,
            shadow=False,
            easy_drag=False,
        )
        logging.info("[orb] window created at (%d, %d)", self._x, self._y)

    def apply_transparency(self) -> None:
        """Apply LWA_COLORKEY after the event loop has started and the window is shown."""
        _apply_colorkey("Atlas")

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
