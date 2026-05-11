"""Atlas — Phase 2A entry point."""

import logging
import sys
from pathlib import Path

import webview

if getattr(sys, "frozen", False):
    BASE_DIR = Path(sys.executable).resolve().parent
else:
    BASE_DIR = Path(__file__).resolve().parent

from logging_setup import setup_logging
setup_logging(BASE_DIR)

try:
    import config.settings as settings
    settings.validate()
    logging.info("[atlas] config loaded — user=%s", settings.ATLAS_USER_NAME)
except RuntimeError as exc:
    logging.warning("[atlas] config: %s (dev mode)", exc)

from broker import Broker
from state_machine import StateMachine, IDLE, PLANNING, REPORTING, ERROR
from planner import planner as planner_mod
from ui.orb.orb_window import OrbWindow
from ui.cockpit.cockpit_window import CockpitWindow
from ui.ui_bridge import UIBridge


def _make_input_handler(fsm: StateMachine, cockpit: CockpitWindow):
    def handle(prompt: str) -> None:
        prompt = prompt.strip()
        if not prompt:
            return

        cockpit.show_user_message(prompt)
        fsm.transition(PLANNING)
        cockpit.set_thinking(True)

        result = planner_mod.plan(prompt)

        cockpit.set_thinking(False)

        if result.get("ok"):
            response = result.get("response", "")
            mode = result.get("mode", "")
            fsm.transition(REPORTING)
            cockpit.show_atlas_response(response, mode=mode)
            fsm.transition(IDLE)
        else:
            error = result.get("error", {})
            msg = error.get("message", "Error desconocido.")
            fsm.transition(ERROR)
            cockpit.show_atlas_response(msg, is_error=True)
            fsm.transition(IDLE)

    return handle


def on_started(orb: OrbWindow) -> None:
    """Called by pywebview on a background thread once windows are ready."""
    logging.info("[atlas] UI ready — applying transparency")
    orb.apply_transparency()


def main() -> None:
    logging.info("=" * 60)
    logging.info("[atlas] Atlas Phase 2A starting")

    broker  = Broker()
    fsm     = StateMachine(broker)
    orb     = OrbWindow(broker)
    cockpit = CockpitWindow()
    bridge  = UIBridge(broker, orb, cockpit)  # noqa: F841

    cockpit.set_input_callback(_make_input_handler(fsm, cockpit))

    orb.start()
    cockpit.start()

    logging.info("[atlas] launching pywebview event loop")
    webview.start(func=on_started, args=(orb,), debug=False)
    logging.info("[atlas] pywebview event loop exited — shutdown")


if __name__ == "__main__":
    main()
