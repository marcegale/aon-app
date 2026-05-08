"""Atlas — Phase 0 skeleton entry point.

Demonstrates the full module wiring and FSM transition demo without
any real AI calls, voice, screenshot, or tool execution.

Expected output: four state transitions logged to atlas.log and stdout,
each producing a broker event that ui_bridge maps to an OrbState.
"""

import logging
import sys
from pathlib import Path

# ── Base directory (frozen exe or source) ───────────────────────────────────
if getattr(sys, "frozen", False):
    BASE_DIR = Path(sys.executable).resolve().parent
else:
    BASE_DIR = Path(__file__).resolve().parent

# ── Logging must be first ────────────────────────────────────────────────────
from logging_setup import setup_logging
setup_logging(BASE_DIR)

# ── Config (tolerates missing .env.local in Phase 0 dev) ────────────────────
try:
    import config.settings as settings
    settings.validate()
    logging.info("[atlas] config loaded — user=%s", settings.ATLAS_USER_NAME)
except RuntimeError as exc:
    logging.warning("[atlas] config: %s (continuing in dev mode)", exc)

# ── Core modules ─────────────────────────────────────────────────────────────
from broker import Broker
from state_machine import StateMachine, IDLE, LISTENING, PLANNING, REPORTING
from ui.orb.orb_window import OrbWindow
from ui.cockpit.cockpit_window import CockpitWindow
from ui.ui_bridge import UIBridge


def main() -> None:
    logging.info("=" * 60)
    logging.info("[atlas] Atlas Phase 0 — skeleton demo starting")

    broker   = Broker()
    fsm      = StateMachine(broker)
    orb      = OrbWindow()
    cockpit  = CockpitWindow()
    bridge   = UIBridge(broker, orb, cockpit)

    orb.start()

    logging.info("[atlas] running FSM demo: IDLE → LISTENING → PLANNING → REPORTING → IDLE")

    fsm.transition(LISTENING)
    fsm.transition(PLANNING)
    fsm.transition(REPORTING)
    fsm.transition(IDLE)

    logging.info("[atlas] demo complete — all transitions successful")

    bridge.stop()
    logging.info("[atlas] Atlas Phase 0 — shutdown clean")


if __name__ == "__main__":
    main()
