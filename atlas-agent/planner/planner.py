import logging
from typing import Any


def plan(prompt: str, context: dict[str, Any] | None = None) -> dict[str, Any]:
    """Request a structured action plan from the backend broker.

    Phase 0 stub — returns a fixed no-op plan without calling any AI service.
    Phase 2 implementation: POST /api/atlas/plan with {prompt, context},
    receive structured plan from Claude (via backend, never directly).
    The desktop never holds API keys.
    """
    logging.info("[planner] plan() called — prompt=%r (stub, Fase 2)", prompt)
    return {
        "intent": "stub",
        "steps": [],
        "requires_permission": False,
        "needs_screenshot": False,
    }
