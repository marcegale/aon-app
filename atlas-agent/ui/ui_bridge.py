import logging
from typing import Any

from broker import Broker, EVT_STATE_CHANGED, EVT_COCKPIT_OPEN
from ui.orb.orb_window import OrbWindow
from ui.orb.orb_state import fsm_to_orb
from ui.cockpit.cockpit_window import CockpitWindow


class UIBridge:
    """Single connection point between the broker and both UI windows.

    OrbWindow and CockpitWindow never know about the broker directly.
    All routing logic lives here.

    Phase 0: subscribers are registered but only log their actions.
    Real rendering is deferred to Phase 1.
    """

    def __init__(
        self,
        broker: Broker,
        orb: OrbWindow,
        cockpit: CockpitWindow,
    ) -> None:
        self._broker = broker
        self._orb = orb
        self._cockpit = cockpit
        self._register()

    def _register(self) -> None:
        self._broker.subscribe(EVT_STATE_CHANGED, self._on_state_changed)
        self._broker.subscribe(EVT_COCKPIT_OPEN, self._on_cockpit_open)

    def _on_state_changed(self, payload: Any) -> None:
        fsm_state = payload.get("to") if isinstance(payload, dict) else None
        if not fsm_state:
            return
        orb_state = fsm_to_orb(fsm_state)
        logging.info(
            "[ui_bridge] FSM %s → OrbState %s", fsm_state, orb_state
        )
        self._orb.set_state(orb_state)
        self._cockpit.send_event(EVT_STATE_CHANGED, payload)

    def _on_cockpit_open(self, payload: Any) -> None:
        logging.info("[ui_bridge] cockpit open requested")
        self._cockpit.open()

    def stop(self) -> None:
        self._orb.stop()
        self._cockpit.close()
        logging.info("[ui_bridge] stopped")
