"""OrbWindow — PySide6 QWidget with true OS-level per-pixel transparency.

pywebview transparent=True on Windows never enables AllowsTransparency on the
WinForms Form, leaving an opaque rectangle behind the orb. LWA_COLORKEY is a
workaround but WebView2 composites its own layers before the colorkey is applied,
so semi-transparent glow pixels still show a dark halo.

PySide6 WA_TranslucentBackground sets WS_EX_LAYERED at the Win32 level natively,
giving real per-pixel alpha compositing. Qt runs in its own daemon thread so
pywebview (CockpitWindow) keeps the main thread unchanged.
set_state() is thread-safe via a QueuedConnection signal.
"""

import ctypes
import logging
import math
import sys
import threading

from PySide6.QtCore import Qt, QPoint, QTimer, Signal, Slot
from PySide6.QtGui import (
    QBrush, QColor, QConicalGradient, QCursor,
    QPainter, QRadialGradient,
)
from PySide6.QtWidgets import QApplication, QWidget

from broker import Broker, EVT_COCKPIT_OPEN

_WINDOW_W = 120
_WINDOW_H = 120
_ORB_R    = 36
_CX       = _WINDOW_W // 2
_CY       = _WINDOW_H // 2
_TICK_MS  = 25   # ~40 fps

# Full-cycle animation period per state (seconds)
_PERIOD = {
    "ORB_IDLE":               3.2,
    "ORB_LISTENING":          1.4,
    "ORB_THINKING":           1.8,
    "ORB_EXECUTING":          0.75,
    "ORB_WAITING_PERMISSION": 1.2,
    "ORB_ERROR":              0.55,
}


def _initial_position() -> tuple[int, int]:
    try:
        u = ctypes.windll.user32
        return (u.GetSystemMetrics(0) - _WINDOW_W - 24,
                u.GetSystemMetrics(1) - _WINDOW_H - 60)
    except Exception:
        return 100, 100


class _OrbWidget(QWidget):
    """Frameless transparent widget that paints the animated orb."""

    state_signal = Signal(str)

    def __init__(self, broker: Broker, x: int, y: int) -> None:
        super().__init__(None)
        self._broker     = broker
        self._state      = "ORB_IDLE"
        self._phase      = 0.0   # animation phase [0, 1)
        self._angle      = 0.0   # rotation for THINKING (degrees)
        self._drag_pos   = QPoint()
        self._drag_start = QPoint()
        self._dragging   = False

        self.setWindowFlags(
            Qt.WindowType.FramelessWindowHint
            | Qt.WindowType.WindowStaysOnTopHint
            | Qt.WindowType.Tool
        )
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.setAttribute(Qt.WidgetAttribute.WA_NoSystemBackground)
        self.setFixedSize(_WINDOW_W, _WINDOW_H)
        self.move(x, y)
        self.setCursor(QCursor(Qt.CursorShape.OpenHandCursor))

        self._timer = QTimer(self)
        self._timer.timeout.connect(self._tick)
        self._timer.start(_TICK_MS)

        self.state_signal.connect(self._on_state, Qt.ConnectionType.QueuedConnection)

    @Slot(str)
    def _on_state(self, state: str) -> None:
        self._state = state
        self._phase = 0.0
        self.update()

    def _tick(self) -> None:
        period = _PERIOD.get(self._state, 2.0)
        self._phase = (self._phase + (_TICK_MS / 1000.0) / period) % 1.0
        if self._state == "ORB_THINKING":
            self._angle = (self._angle + 360.0 * (_TICK_MS / 1000.0) / _PERIOD["ORB_THINKING"]) % 360.0
        self.update()

    # ── Paint ──────────────────────────────────────────────────────────────

    def paintEvent(self, _) -> None:
        p = QPainter(self)
        p.setRenderHint(QPainter.RenderHint.Antialiasing)

        # Wipe to fully transparent first
        p.setCompositionMode(QPainter.CompositionMode.CompositionMode_Source)
        p.fillRect(self.rect(), QColor(0, 0, 0, 0))
        p.setCompositionMode(QPainter.CompositionMode.CompositionMode_SourceOver)

        pulse = (math.sin(self._phase * 2 * math.pi) + 1) / 2  # [0, 1]
        s = self._state

        if s == "ORB_IDLE":
            self._glow(p, QColor(26, 159, 255), 0.35 + 0.20 * pulse)
            self._fill(p, "#4dd9ff", "#0a6ef5", "#052d8a")

        elif s == "ORB_LISTENING":
            self._glow(p, QColor(0, 230, 118), 0.50 + 0.35 * pulse)
            self._fill(p, "#80ffb0", "#00c853", "#00571e")

        elif s == "ORB_THINKING":
            self._glow(p, QColor(124, 77, 255), 0.40 + 0.20 * pulse)
            self._thinking(p)

        elif s == "ORB_EXECUTING":
            self._glow(p, QColor(255, 152, 0), 0.50 + 0.45 * pulse)
            self._fill(p, "#ffd180", "#ff9800", "#7a3800")

        elif s == "ORB_WAITING_PERMISSION":
            r = int(_ORB_R * (1.0 + 0.12 * pulse))
            self._glow(p, QColor(255, 235, 59), 0.50 + 0.20 * pulse, r=r)
            self._fill(p, "#fff176", "#ffeb3b", "#7a6000", r=r)

        elif s == "ORB_ERROR":
            self._glow(p, QColor(244, 67, 54), 0.55 + 0.35 * pulse)
            self._fill(p, "#ff8a80", "#f44336", "#7a0000")

        p.end()

    def _glow(self, p: QPainter, color: QColor, alpha: float, r: int = _ORB_R) -> None:
        for extra, a_div in ((16, 1.0), (28, 2.2), (44, 4.5)):
            gr = r + extra
            c = QColor(color)
            c.setAlphaF(min(1.0, alpha / a_div))
            g = QRadialGradient(_CX, _CY, gr)
            g.setColorAt(0.0, c)
            g.setColorAt(1.0, QColor(0, 0, 0, 0))
            p.setPen(Qt.PenStyle.NoPen)
            p.setBrush(QBrush(g))
            p.drawEllipse(_CX - gr, _CY - gr, gr * 2, gr * 2)

    def _fill(self, p: QPainter, core: str, mid: str, edge: str, r: int = _ORB_R) -> None:
        fx = _CX - int(r * 0.24)
        fy = _CY - int(r * 0.30)
        g = QRadialGradient(fx, fy, r * 1.6)
        g.setColorAt(0.00, QColor(core))
        g.setColorAt(0.55, QColor(mid))
        g.setColorAt(1.00, QColor(edge))
        p.setBrush(QBrush(g))
        p.setPen(Qt.PenStyle.NoPen)
        p.drawEllipse(_CX - r, _CY - r, r * 2, r * 2)

    def _thinking(self, p: QPainter) -> None:
        g = QConicalGradient(_CX, _CY, self._angle)
        g.setColorAt(0.00, QColor("#7c4dff"))
        g.setColorAt(0.33, QColor("#b388ff"))
        g.setColorAt(0.66, QColor("#3d1a8a"))
        g.setColorAt(1.00, QColor("#7c4dff"))
        p.setBrush(QBrush(g))
        p.setPen(Qt.PenStyle.NoPen)
        p.drawEllipse(_CX - _ORB_R, _CY - _ORB_R, _ORB_R * 2, _ORB_R * 2)

    # ── Drag & click ───────────────────────────────────────────────────────

    def mousePressEvent(self, e) -> None:
        if e.button() == Qt.MouseButton.LeftButton:
            self._drag_start = e.globalPosition().toPoint()
            self._drag_pos   = e.globalPosition().toPoint() - self.frameGeometry().topLeft()
            self._dragging   = False
            self.setCursor(QCursor(Qt.CursorShape.ClosedHandCursor))

    def mouseMoveEvent(self, e) -> None:
        if e.buttons() & Qt.MouseButton.LeftButton:
            d = e.globalPosition().toPoint() - self._drag_start
            if not self._dragging and (abs(d.x()) > 5 or abs(d.y()) > 5):
                self._dragging = True
            if self._dragging:
                self.move(e.globalPosition().toPoint() - self._drag_pos)

    def mouseReleaseEvent(self, e) -> None:
        if e.button() == Qt.MouseButton.LeftButton:
            if not self._dragging:
                self._broker.emit(EVT_COCKPIT_OPEN, None)
            self._dragging = False
            self.setCursor(QCursor(Qt.CursorShape.OpenHandCursor))


class OrbWindow:
    """Manages the PySide6 orb widget in its own Qt thread.

    pywebview (CockpitWindow) keeps the main thread; Qt runs here.
    set_state() is thread-safe via a queued signal.
    """

    def __init__(self, broker: Broker) -> None:
        self._broker = broker
        self._widget: _OrbWidget | None = None
        self._app:    QApplication | None = None
        self._ready  = threading.Event()
        self._x, self._y = _initial_position()

    def start(self) -> None:
        t = threading.Thread(target=self._run_qt, name="qt-orb", daemon=True)
        t.start()
        if not self._ready.wait(timeout=5.0):
            logging.warning("[orb] Qt thread did not become ready in 5s")

    def _run_qt(self) -> None:
        self._app    = QApplication.instance() or QApplication(sys.argv)
        self._widget = _OrbWidget(self._broker, self._x, self._y)
        self._widget.show()
        self._ready.set()
        logging.info("[orb] Qt event loop starting (thread: %s)", threading.current_thread().name)
        self._app.exec()
        logging.info("[orb] Qt event loop exited")

    def apply_transparency(self) -> None:
        pass  # WA_TranslucentBackground handles this natively at widget creation

    def set_state(self, orb_state: str) -> None:
        if self._widget is None:
            return
        self._widget.state_signal.emit(orb_state)
        logging.info("[orb] set_state(%s)", orb_state)

    def stop(self) -> None:
        if self._app is not None:
            try:
                self._app.quit()
            except Exception:
                pass
        logging.info("[orb] stopped")
