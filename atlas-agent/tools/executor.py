"""Generic tool executor — Phase 3B.

Maps tool.operation keys to Python callables that return RawResult.
Wraps each call with timing, redaction, and truncation to produce ActionResult.
The FSM must be in EXECUTING state before this is called — that gate is owned
by atlas.py, not here.
"""

from __future__ import annotations

import datetime
import logging
import time
from typing import Callable

from planner.models import Action, ActionResult, RawResult
from tools.redactor import redact
from tools.terminal import run_command

_MAX_STDOUT = 2000
_MAX_STDERR = 300

# Registry: "tool.operation" → function(params: dict) -> RawResult
_REGISTRY: dict[str, Callable[[dict], RawResult]] = {
    "terminal.run_command": run_command,
}


def _now_iso() -> str:
    return datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")


def execute(action: Action) -> ActionResult:
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
            error_message=f"Tool '{key}' no disponible.",
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
