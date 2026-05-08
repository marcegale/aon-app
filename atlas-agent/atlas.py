"""Atlas — Phase 1 entry point.

pywebview must own the main thread.
All FSM/broker logic runs in the on_started() background thread.
"""

import logging
import sys
import threading
import time
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
from state_machine import (
    StateMachine,
    IDLE, LISTENING, CAPTURING_CONTEXT, PLANNING,
    WAITING_PERMISSION, EXECUTING, VERIFYING, REPORTING, ERROR,
)
from ui.orb.orb_window import OrbWindow
from ui.cockpit.cockpit_window import CockpitWindow
from ui.ui_bridge import UIBridge


def _demo(fsm: StateMachine) -> None:
    """Timed FSM demo — runs in background thread after UI is ready."""
    steps = [
        (LISTENING,  1.2),
        (PLANNING,   1.5),
        (EXECUTING,  1.5),
        (VERIFYING,  1.0),
        (REPORTING,  1.2),
        (IDLE,       0.0),
    ]
    for state, delay in steps:
        fsm.transition(state)
        if delay:
            time.sleep(delay)
    logging.info("[atlas] demo complete")


def on_started(broker: Broker, fsm: StateMachine, orb: OrbWindow) -> None:
    """Called by pywebview on a background thread once windows are ready."""
    logging.info("[atlas] UI ready — applying transparency")
    orb.apply_transparency()
    time.sleep(1.5)
    _demo(fsm)


def main() -> None:
    logging.info("=" * 60)
    logging.info("[atlas] Atlas Phase 1 starting")
    logging.info("[atlas] build_marker=2a4ac52 transparency_colorkey")

    broker  = Broker()
    fsm     = StateMachine(broker)
    orb     = OrbWindow(broker)
    cockpit = CockpitWindow()
    bridge  = UIBridge(broker, orb, cockpit)  # noqa: F841 — kept alive

    # Create windows (no event loop yet)
    orb.start()
    cockpit.start()

    logging.info("[atlas] launching pywebview event loop")

    webview.start(
        func=on_started,
        args=(broker, fsm, orb),
        debug=False,
    )

    logging.info("[atlas] pywebview event loop exited — shutdown")


if __name__ == "__main__":
    main()
