from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any

from capabilities.registry import REGISTRY as _CAP_REGISTRY

# ── Tool/operation/level allowlists derived from capability registry ──────────
# Only tools present in REGISTRY are accepted; executor decides availability.
_KNOWN_TOOLS: set[str] = set(_CAP_REGISTRY.keys())
_KNOWN_OPERATIONS: dict[str, set[str]] = {
    cap_id: {op.id for op in cap.operations}
    for cap_id, cap in _CAP_REGISTRY.items()
}
_KNOWN_LEVELS: set[str] = {"PUBLIC", "SENSITIVE", "DESTRUCTIVE"}


@dataclass
class ActionDisplay:
    title: str
    description: str
    warning: str | None = None


@dataclass
class Action:
    id: str
    tool: str
    operation: str
    params: dict[str, Any]
    permission_level: str
    display: ActionDisplay
    requires_result: bool = True


@dataclass
class ActionPlan:
    intent: str
    actions: list[Action] = field(default_factory=list)


@dataclass
class ToolResult:  # legacy — kept for backward compat; new code uses ActionResult
    ok: bool
    output: str
    error: str | None = None
    returncode: int | None = None


@dataclass
class RawResult:
    """Internal contract: tool function → executor. Never exposed to UI or backend."""
    ok: bool
    stdout: str = ""
    stderr: str = ""
    returncode: int | None = None
    error_code: str | None = None     # "TIMEOUT"|"BLOCKED"|"EXEC_ERROR"|"NON_ZERO_EXIT"
    error_message: str | None = None


@dataclass
class ConnectorRequiredResult:
    """Metadata for CONNECTOR_REQUIRED results — identifies the missing OAuth connector."""
    provider: str
    status: str                       # "disconnected"|"expired"|"error"
    display_name: str
    connect_url: str


@dataclass
class DeviceIdentity:
    """Static identity of the local Atlas installation."""
    device_key: str
    user_name: str
    platform: str = "windows"


@dataclass
class ActionResult:
    """Structured result of a tool execution. Passed to cockpit for display."""
    ok: bool
    tool: str
    operation: str
    permission_level: str
    stdout: str
    stderr: str
    returncode: int | None
    duration_ms: int
    truncated: bool
    stderr_truncated: bool
    error_code: str | None            # "TIMEOUT"|"BLOCKED"|"EXEC_ERROR"|"NON_ZERO_EXIT"|"CAPABILITY_UNAVAILABLE"|"CONNECTOR_REQUIRED"|None
    error_message: str | None
    started_at: str                   # ISO 8601 UTC
    finished_at: str                  # ISO 8601 UTC
    connector: ConnectorRequiredResult | None = None


def parse_action_plan(raw: Any) -> ActionPlan | None:
    """Validate and parse a raw action_plan dict from the backend.

    Returns None if the plan is absent, malformed, or has no valid actions.
    This is a second-layer defense — backend already validates, but desktop
    does not trust backend blindly.
    """
    if not isinstance(raw, dict):
        return None

    actions_raw = raw.get("actions")
    if not isinstance(actions_raw, list) or not actions_raw:
        return None

    actions: list[Action] = []
    for a in actions_raw:
        if not isinstance(a, dict):
            continue

        action_id    = a.get("id", "")
        tool         = a.get("tool", "")
        operation    = a.get("operation", "")
        params       = a.get("params", {})
        level        = a.get("permission_level", "")
        display_raw  = a.get("display", {})
        req_result   = a.get("requires_result", True)

        if tool not in _KNOWN_TOOLS:
            logging.warning("[models] unknown tool '%s' — skipped", tool)
            continue
        if operation not in _KNOWN_OPERATIONS.get(tool, set()):
            logging.warning("[models] unknown operation '%s.%s' — skipped", tool, operation)
            continue
        if level not in _KNOWN_LEVELS:
            logging.warning("[models] unknown level '%s' — skipped", level)
            continue
        if not isinstance(params, dict):
            continue
        if not isinstance(display_raw, dict):
            continue

        title       = display_raw.get("title", "")
        description = display_raw.get("description", "")
        if not isinstance(title, str) or not title:
            continue
        if not isinstance(description, str) or not description:
            continue

        actions.append(Action(
            id=action_id or f"act-{len(actions)}",
            tool=tool,
            operation=operation,
            params=params,
            permission_level=level,
            display=ActionDisplay(
                title=title,
                description=description,
                warning=display_raw.get("warning") or None,
            ),
            requires_result=bool(req_result),
        ))

    if not actions:
        return None

    return ActionPlan(
        intent=raw.get("intent", ""),
        actions=actions,
    )
