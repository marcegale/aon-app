"""Atlas — Phase 3A entry point.

Action Runtime + Permission Card + Generic Tool Executor.
"""

from __future__ import annotations

import logging
import sys
import threading
from pathlib import Path
from typing import Any

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
    IDLE, PLANNING, WAITING_PERMISSION,
    EXECUTING, VERIFYING, REPORTING, ERROR,
)
from planner import planner as planner_mod
from planner.models import parse_action_plan, Action
from tools.executor import execute as tool_execute
from permissions.guard import requires_card, is_destructive_blocked
from ui.orb.orb_window import OrbWindow
from ui.cockpit.cockpit_window import CockpitWindow
from ui.ui_bridge import UIBridge


class _ActionGate:
    """Coordinates the permission decision between the input thread and JS callbacks."""

    def __init__(self) -> None:
        self._event    = threading.Event()
        self._approved = False

    def set_pending(self) -> None:
        self._event.clear()
        self._approved = False

    def resolve(self, approved: bool) -> None:
        self._approved = approved
        self._event.set()

    def wait(self, timeout: float = 300.0) -> bool:
        """Block until user decides or timeout. Returns True if approved."""
        fired = self._event.wait(timeout=timeout)
        return fired and self._approved


def _action_to_dict(action: Action) -> dict[str, Any]:
    return {
        "id":               action.id,
        "tool":             action.tool,
        "operation":        action.operation,
        "permission_level": action.permission_level,
        "display": {
            "title":       action.display.title,
            "description": action.display.description,
            "warning":     action.display.warning,
        },
    }


def _make_input_handler(
    fsm: StateMachine,
    cockpit: CockpitWindow,
    gate: _ActionGate,
):
    def handle(prompt: str) -> None:
        prompt = prompt.strip()
        if not prompt:
            return

        cockpit.show_user_message(prompt)
        fsm.transition(PLANNING)
        cockpit.set_thinking(True)

        result = planner_mod.plan(prompt)
        cockpit.set_thinking(False)

        if not result.get("ok"):
            error = result.get("error", {})
            msg   = error.get("message", "Error desconocido.")
            fsm.transition(ERROR)
            cockpit.show_atlas_response(msg, is_error=True)
            fsm.transition(IDLE)
            return

        response_text = result.get("response", "")
        mode          = result.get("mode", "ai")
        raw_plan      = result.get("action_plan")
        action_plan   = parse_action_plan(raw_plan) if raw_plan else None

        # Always show the conversational response text first
        if response_text:
            cockpit.show_atlas_response(response_text, mode=mode)

        if action_plan is None or not action_plan.actions:
            # Conversational — done
            fsm.transition(REPORTING)
            fsm.transition(IDLE)
            return

        # Agentic — Phase 3A handles first action only
        action = action_plan.actions[0]

        if is_destructive_blocked(action):
            # Show informational card; never execute
            fsm.transition(WAITING_PERMISSION)
            cockpit.show_permission_card(_action_to_dict(action), destructive_blocked=True)
            gate.set_pending()
            gate.wait(timeout=300.0)
            cockpit.hide_permission_card()
            cockpit.show_atlas_response(
                "Las acciones destructivas no están disponibles todavía.",
                is_error=False,
            )
            fsm.transition(IDLE)
            return

        if requires_card(action):
            # SENSITIVE — show card, wait for decision
            fsm.transition(WAITING_PERMISSION)
            cockpit.show_permission_card(_action_to_dict(action), destructive_blocked=False)
            gate.set_pending()
            approved = gate.wait(timeout=300.0)
            cockpit.hide_permission_card()

            if not approved:
                cockpit.show_atlas_response("Acción cancelada.", is_error=False)
                fsm.transition(IDLE)
                return

        # Execute (PUBLIC direct, or SENSITIVE approved)
        fsm.transition(EXECUTING)
        tool_result = tool_execute(action)

        # Verify
        fsm.transition(VERIFYING)

        # Report
        fsm.transition(REPORTING)
        cockpit.show_tool_result(tool_result.output or tool_result.error or "", ok=tool_result.ok)
        fsm.transition(IDLE)

    return handle


def on_started(orb: OrbWindow) -> None:
    logging.info("[atlas] UI ready — applying transparency")
    orb.apply_transparency()


def main() -> None:
    logging.info("=" * 60)
    logging.info("[atlas] Atlas Phase 3A starting")

    broker  = Broker()
    fsm     = StateMachine(broker)
    orb     = OrbWindow(broker)
    cockpit = CockpitWindow()
    bridge  = UIBridge(broker, orb, cockpit)  # noqa: F841

    gate = _ActionGate()
    cockpit.set_approve_callback(lambda _: gate.resolve(True))
    cockpit.set_cancel_callback(lambda _: gate.resolve(False))
    cockpit.set_input_callback(_make_input_handler(fsm, cockpit, gate))

    orb.start()
    cockpit.start()

    logging.info("[atlas] launching pywebview event loop")
    webview.start(func=on_started, args=(orb,), debug=False)
    logging.info("[atlas] pywebview event loop exited — shutdown")


if __name__ == "__main__":
    main()
