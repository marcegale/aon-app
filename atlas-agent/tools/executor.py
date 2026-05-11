"""Generic tool executor — Phase 3C.

Two-stage dispatch:
  1. Capability registry check — rejects stub/disabled tools with CAPABILITY_UNAVAILABLE.
  2. Tool handler dispatch — executes enabled tools via _REGISTRY callable map.

Wraps each call with timing, redaction, and truncation to produce ActionResult.
FSM must be in EXECUTING state before this is called — that gate is atlas.py's job.
"""

from __future__ import annotations

import datetime
import logging
import time
from typing import Callable

from capabilities.registry import REGISTRY as _CAP_REGISTRY
from planner.models import Action, ActionResult, ConnectorRequiredResult, RawResult
from tools.redactor import redact
from tools.terminal import run_command

_MAX_STDOUT = 2000
_MAX_STDERR = 300

# Runtime dispatch: "tool.operation" → function(params: dict) -> RawResult
# Only enabled capabilities should have entries here.
_REGISTRY: dict[str, Callable[[dict], RawResult]] = {
    "terminal.run_command": run_command,
}

_PROVIDER_ALLOWLIST: frozenset[str] = frozenset({
    "gmail", "google_calendar", "outlook_mail", "outlook_calendar",
    "whatsapp", "browser_profile", "local_filesystem", "local_apps",
    "local_agent_claude", "local_agent_codex", "web_agent",
})

_TOOL_PROVIDER_FALLBACK: dict[str, str] = {
    "email":    "gmail",
    "calendar": "google_calendar",
    "messages": "whatsapp",
}

_CONNECTOR_DISPLAY_NAMES: dict[str, str] = {
    "gmail":             "Gmail",
    "outlook_mail":      "Outlook Mail",
    "google_calendar":   "Google Calendar",
    "outlook_calendar":  "Outlook Calendar",
    "whatsapp":          "WhatsApp",
    "browser_profile":   "Browser Profile",
    "local_filesystem":  "Local Filesystem",
    "local_apps":        "Local Apps",
    "local_agent_claude":"Claude (local)",
    "local_agent_codex": "Codex (local)",
    "web_agent":         "Web Agent",
}

_CONNECT_URL = "https://app.aigency.com/atlas/connectors"


def _resolve_provider(action: Action) -> str:
    p = action.params.get("provider", "")
    if isinstance(p, str) and p in _PROVIDER_ALLOWLIST:
        return p
    return _TOOL_PROVIDER_FALLBACK.get(action.tool, action.tool)


def _now_iso() -> str:
    return datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")


def _unavailable(action: Action, reason: str) -> ActionResult:
    ts = _now_iso()
    return ActionResult(
        ok=False,
        tool=action.tool,
        operation=action.operation,
        permission_level=action.permission_level,
        stdout="", stderr="",
        returncode=None,
        duration_ms=0,
        truncated=False, stderr_truncated=False,
        error_code="CAPABILITY_UNAVAILABLE",
        error_message=reason,
        started_at=ts, finished_at=ts,
    )


def execute(action: Action) -> ActionResult:
    # ── Stage 1: capability availability check ────────────────────────────────
    cap = _CAP_REGISTRY.get(action.tool)
    if cap is None:
        logging.error("[executor] unknown capability '%s'", action.tool)
        ts = _now_iso()
        return ActionResult(
            ok=False,
            tool=action.tool,
            operation=action.operation,
            permission_level=action.permission_level,
            stdout="", stderr="",
            returncode=None,
            duration_ms=0,
            truncated=False, stderr_truncated=False,
            error_code="EXEC_ERROR",
            error_message=f"Capability '{action.tool}' desconocida.",
            started_at=ts, finished_at=ts,
        )

    if cap.availability != "enabled":
        if cap.requires_external_auth:
            provider = _resolve_provider(action)
            display_name = _CONNECTOR_DISPLAY_NAMES.get(provider, provider.replace("_", " ").title())
            logging.info("[executor] capability '%s' requires external auth — CONNECTOR_REQUIRED", action.tool)
            ts = _now_iso()
            return ActionResult(
                ok=False,
                tool=action.tool,
                operation=action.operation,
                permission_level=action.permission_level,
                stdout="", stderr="",
                returncode=None,
                duration_ms=0,
                truncated=False, stderr_truncated=False,
                error_code="CONNECTOR_REQUIRED",
                error_message=f"{display_name} no está conectado.",
                started_at=ts, finished_at=ts,
                connector=ConnectorRequiredResult(
                    provider=provider,
                    status="disconnected",
                    display_name=display_name,
                    connect_url=_CONNECT_URL,
                ),
            )
        reason = cap.unavailable_reason or "Esta capacidad no está disponible todavía."
        logging.info("[executor] capability '%s' is %s — returning unavailable", action.tool, cap.availability)
        return _unavailable(action, reason)

    # ── Stage 2: tool handler dispatch ───────────────────────────────────────
    key = f"{action.tool}.{action.operation}"
    fn  = _REGISTRY.get(key)

    if fn is None:
        logging.error("[executor] no handler for '%s'", key)
        ts = _now_iso()
        return ActionResult(
            ok=False,
            tool=action.tool,
            operation=action.operation,
            permission_level=action.permission_level,
            stdout="", stderr="",
            returncode=None,
            duration_ms=0,
            truncated=False, stderr_truncated=False,
            error_code="EXEC_ERROR",
            error_message=f"Operación '{key}' no disponible.",
            started_at=ts, finished_at=ts,
        )

    started_at = _now_iso()
    t0 = time.monotonic()

    try:
        raw: RawResult = fn(action.params)
    except Exception as exc:
        elapsed = max(0, int((time.monotonic() - t0) * 1000))
        logging.error("[executor] %s raised: %s", key, exc)
        return ActionResult(
            ok=False,
            tool=action.tool,
            operation=action.operation,
            permission_level=action.permission_level,
            stdout="", stderr="",
            returncode=None,
            duration_ms=elapsed,
            truncated=False, stderr_truncated=False,
            error_code="EXEC_ERROR",
            error_message="Error inesperado al ejecutar.",
            started_at=started_at, finished_at=_now_iso(),
        )

    elapsed = max(0, int((time.monotonic() - t0) * 1000))
    finished_at = _now_iso()

    stdout_clean = redact(raw.stdout or "")
    stderr_clean = redact(raw.stderr or "")

    truncated        = len(stdout_clean) > _MAX_STDOUT
    stderr_truncated = len(stderr_clean) > _MAX_STDERR
    stdout = stdout_clean[:_MAX_STDOUT]
    stderr = stderr_clean[:_MAX_STDERR]

    ok = (raw.error_code is None) and (raw.returncode == 0 or raw.returncode is None)

    logging.info(
        "[executor] %s rc=%s duration_ms=%d ok=%s error_code=%s",
        key, raw.returncode, elapsed, ok, raw.error_code,
    )

    return ActionResult(
        ok=ok,
        tool=action.tool,
        operation=action.operation,
        permission_level=action.permission_level,
        stdout=stdout,
        stderr=stderr,
        returncode=raw.returncode,
        duration_ms=elapsed,
        truncated=truncated,
        stderr_truncated=stderr_truncated,
        error_code=raw.error_code,
        error_message=raw.error_message,
        started_at=started_at,
        finished_at=finished_at,
    )
