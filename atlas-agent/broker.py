import logging
import threading
from collections import defaultdict
from typing import Any, Callable

# ── Event name constants ────────────────────────────────────────────────────
EVT_STATE_CHANGED       = "state_changed"
EVT_USER_INPUT          = "user_input"
EVT_TRANSCRIPT          = "transcript"
EVT_CONTEXT_READY       = "context_ready"
EVT_PLAN_READY          = "plan_ready"
EVT_PERMISSION_GRANTED  = "permission_granted"
EVT_PERMISSION_DENIED   = "permission_denied"
EVT_TOOL_RESULT         = "tool_result"
EVT_VERIFICATION_DONE   = "verification_done"
EVT_COCKPIT_OPEN        = "cockpit_open"
EVT_ERROR               = "error"


class Broker:
    """Thread-safe synchronous pub/sub event bus.

    All listeners for an event are called in the thread that calls emit().
    A listener that raises will not prevent other listeners from running.
    """

    def __init__(self) -> None:
        self._listeners: dict[str, list[Callable]] = defaultdict(list)
        self._lock = threading.Lock()

    def subscribe(self, event: str, callback: Callable) -> None:
        with self._lock:
            self._listeners[event].append(callback)

    def emit(self, event: str, payload: Any = None) -> None:
        with self._lock:
            callbacks = list(self._listeners.get(event, []))
        for cb in callbacks:
            try:
                cb(payload)
            except Exception as exc:
                logging.error("[broker] listener error on '%s': %s", event, exc)
