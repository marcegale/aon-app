from dataclasses import dataclass, field
from typing import Any


class PermissionLevel:
    PUBLIC      = "PUBLIC"       # No dialog required
    SENSITIVE   = "SENSITIVE"    # Ask once per session, cache approval
    DESTRUCTIVE = "DESTRUCTIVE"  # Always ask, show full payload, never cache


@dataclass
class ToolDefinition:
    id: str
    name: str
    description: str
    schema: dict[str, Any]
    permission_level: str = PermissionLevel.PUBLIC


# Tools are registered here as phases introduce them.
# Phase 0: empty — no real tools yet.
REGISTRY: list[ToolDefinition] = []

_by_id: dict[str, ToolDefinition] = {}


def register(tool: ToolDefinition) -> None:
    REGISTRY.append(tool)
    _by_id[tool.id] = tool


def get_tool(tool_id: str) -> ToolDefinition | None:
    return _by_id.get(tool_id)


def get_all_schemas() -> list[dict[str, Any]]:
    return [
        {
            "name": t.id,
            "description": t.description,
            "parameters": t.schema,
        }
        for t in REGISTRY
    ]
