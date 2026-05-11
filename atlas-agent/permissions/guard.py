"""Permission guard — Phase 3A.

Utility functions used by atlas.py to decide the action flow.
No caching in Phase 3A — every SENSITIVE action shows a card.
DESTRUCTIVE actions are shown in an informational card but never executed.
"""

from __future__ import annotations

from planner.models import Action

LEVEL_PUBLIC      = "PUBLIC"
LEVEL_SENSITIVE   = "SENSITIVE"
LEVEL_DESTRUCTIVE = "DESTRUCTIVE"


def requires_card(action: Action) -> bool:
    """True if a permission card must be shown before deciding."""
    return action.permission_level in (LEVEL_SENSITIVE, LEVEL_DESTRUCTIVE)


def is_destructive_blocked(action: Action) -> bool:
    """True if action is DESTRUCTIVE (not executable in Phase 3A)."""
    return action.permission_level == LEVEL_DESTRUCTIVE


def is_executable(action: Action) -> bool:
    """True if action may proceed to EXECUTING (PUBLIC or approved SENSITIVE)."""
    return action.permission_level in (LEVEL_PUBLIC, LEVEL_SENSITIVE)
