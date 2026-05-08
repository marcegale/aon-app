from state_machine import (
    IDLE, LISTENING, CAPTURING_CONTEXT, PLANNING,
    WAITING_PERMISSION, EXECUTING, VERIFYING, REPORTING, ERROR,
)

# ── Orb visual states ────────────────────────────────────────────────────────
ORB_IDLE                = "ORB_IDLE"
ORB_LISTENING           = "ORB_LISTENING"
ORB_THINKING            = "ORB_THINKING"
ORB_EXECUTING           = "ORB_EXECUTING"
ORB_WAITING_PERMISSION  = "ORB_WAITING_PERMISSION"
ORB_ERROR               = "ORB_ERROR"

# ── FSM state → Orb visual state ────────────────────────────────────────────
# Nine FSM states map to six visual states.
# CAPTURING_CONTEXT, PLANNING, VERIFYING, REPORTING all show ORB_THINKING
# because from the user's perspective the orb is "processing".
FSM_TO_ORB: dict[str, str] = {
    IDLE:               ORB_IDLE,
    LISTENING:          ORB_LISTENING,
    CAPTURING_CONTEXT:  ORB_THINKING,
    PLANNING:           ORB_THINKING,
    WAITING_PERMISSION: ORB_WAITING_PERMISSION,
    EXECUTING:          ORB_EXECUTING,
    VERIFYING:          ORB_THINKING,
    REPORTING:          ORB_THINKING,
    ERROR:              ORB_ERROR,
}


def fsm_to_orb(fsm_state: str) -> str:
    return FSM_TO_ORB.get(fsm_state, ORB_IDLE)
