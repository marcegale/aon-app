"""Generic tool executor for Atlas Phase 3A.

Maps tool.operation keys to Python callables.
The FSM must be in EXECUTING state before this is called — that
gate is owned by atlas.py, not here.
"""

from __future__ import annotations

import logging
from typing import Callable

from planner.models import Action, ToolResult
from tools.terminal import run_command

# Registry: "tool.operation" → function(params: dict) -> ToolResult
_REGISTRY: dict[str, Callable[[dict], ToolResult]] = {
    "terminal.run_command": run_command,
}


def execute(action: Action) -> ToolResult:
    key = f"{action.tool}.{action.operation}"
    fn  = _REGISTRY.get(key)
    if fn is None:
        logging.error("[executor] no handler for '%s'", key)
        return ToolResult(ok=False, output="", error=f"Tool '{key}' no disponible.")
    logging.info("[executor] running %s", key)
    try:
        return fn(action.params)
    except Exception as exc:
        logging.error("[executor] %s raised: %s", key, exc)
        return ToolResult(ok=False, output="", error="Error inesperado al ejecutar.")
