import logging
from typing import Any


def request_permission(
    tool_id: str,
    permission_level: str,
    payload: dict[str, Any],
) -> bool:
    """Gate tool execution by permission level.

    Phase 0 stub — always returns True (no UI to show dialogs yet).

    Phase 4 implementation:
      PUBLIC      → pass through, no dialog.
      SENSITIVE   → show dialog, cache approval for the session.
      DESTRUCTIVE → always show dialog with full payload, never cache.
    """
    logging.info(
        "[guard] request_permission tool=%s level=%s — stub approves (Fase 4)",
        tool_id,
        permission_level,
    )
    return True
