import logging
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from broker import Broker

# ── State constants ─────────────────────────────────────────────────────────
IDLE                = "IDLE"
LISTENING           = "LISTENING"
CAPTURING_CONTEXT   = "CAPTURING_CONTEXT"
PLANNING            = "PLANNING"
WAITING_PERMISSION  = "WAITING_PERMISSION"
EXECUTING           = "EXECUTING"
VERIFYING           = "VERIFYING"
REPORTING           = "REPORTING"
ERROR               = "ERROR"

ALL_STATES = {
    IDLE, LISTENING, CAPTURING_CONTEXT, PLANNING,
    WAITING_PERMISSION, EXECUTING, VERIFYING, REPORTING, ERROR,
}

# ── Valid transitions ────────────────────────────────────────────────────────
# ERROR is always reachable from any state (handled separately).
TRANSITIONS: dict[str, set[str]] = {
    IDLE:               {LISTENING, ERROR},
    LISTENING:          {CAPTURING_CONTEXT, PLANNING, ERROR},
    CAPTURING_CONTEXT:  {PLANNING, ERROR},
    PLANNING:           {WAITING_PERMISSION, EXECUTING, REPORTING, ERROR},
    WAITING_PERMISSION: {EXECUTING, IDLE, ERROR},
    EXECUTING:          {VERIFYING, ERROR},
    VERIFYING:          {REPORTING, ERROR},
    REPORTING:          {IDLE, ERROR},
    ERROR:              {IDLE},
}


class StateMachine:
    def __init__(self, broker: "Broker") -> None:
        self._state = IDLE
        self._broker = broker
        logging.info("[fsm] initialized — state=%s", self._state)

    @property
    def state(self) -> str:
        return self._state

    def transition(self, new_state: str) -> bool:
        if new_state not in ALL_STATES:
            logging.error("[fsm] unknown state '%s'", new_state)
            self._force_error(f"unknown target state: {new_state}")
            return False

        allowed = TRANSITIONS.get(self._state, set()) | {ERROR}
        if new_state not in allowed:
            logging.error(
                "[fsm] invalid transition %s → %s", self._state, new_state
            )
            self._force_error(
                f"invalid transition {self._state} → {new_state}"
            )
            return False

        prev = self._state
        self._state = new_state
        logging.info("[fsm] %s → %s", prev, new_state)
        self._broker.emit("state_changed", {"from": prev, "to": new_state})
        return True

    def _force_error(self, reason: str) -> None:
        prev = self._state
        self._state = ERROR
        logging.error("[fsm] forced ERROR — reason: %s", reason)
        self._broker.emit("state_changed", {"from": prev, "to": ERROR, "reason": reason})
