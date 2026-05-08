import logging
from typing import Any


class CockpitWindow:
    """Optional expanded view of Atlas.

    The cockpit shows conversation history, action details, and settings.
    It can be opened and closed without affecting the running agent.
    The OrbWindow remains the primary always-visible interface.

    Phase 0: all methods are stubs. Real implementation (pywebview panel
    with full HTML/CSS/JS UI) is deferred to Phase 1.
    """

    def open(self) -> None:
        logging.info("[cockpit] CockpitWindow.open() — pendiente Fase 1")

    def close(self) -> None:
        logging.info("[cockpit] CockpitWindow.close() — pendiente Fase 1")

    def send_event(self, event_name: str, payload: Any = None) -> None:
        logging.info(
            "[cockpit] send_event(%s, %s) — pendiente Fase 1", event_name, payload
        )
