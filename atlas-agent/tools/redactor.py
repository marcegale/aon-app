"""Output redactor — strips obvious secret patterns before display or logging.

Applied to stdout and stderr in executor.py. Never applied to internally-generated
error messages (those never contain user data).
"""

from __future__ import annotations

import re

# Matches: name = value  or  name: value  (case-insensitive, value ≥4 non-whitespace chars)
_PATTERN = re.compile(
    r'(?i)'
    r'(token|api[_-]?key|password|passwd|secret|authorization|bearer)'
    r'(\s*[=:]\s*)'
    r'(\S{4,})',
)


def redact(text: str) -> str:
    """Replace secret-looking values with *** in text. Returns text unchanged if empty."""
    if not text:
        return text
    return _PATTERN.sub(lambda m: m.group(1) + m.group(2) + "***", text)
