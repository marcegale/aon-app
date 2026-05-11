"""Capability metadata models — used by registry and executor."""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class CapabilityOperation:
    id:               str    # e.g. "run_command", "send_message"
    display_name:     str    # human-readable
    permission_level: str    # "PUBLIC" | "SENSITIVE" | "DESTRUCTIVE"
    is_destructive:   bool = False


@dataclass
class Capability:
    id:                     str
    display_name:           str
    category:               str   # "system"|"agent"|"browser"|"communication"|"file"|"app"
    operations:             list[CapabilityOperation] = field(default_factory=list)
    availability:           str = "stub"   # "enabled" | "stub" | "disabled"
    requires_local_runtime: bool = False
    requires_external_auth: bool = False
    unavailable_reason:     str | None = None
