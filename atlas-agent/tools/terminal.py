"""terminal.run_command — Phase 3A read-only tool.

Validates commands against a strict allowlist before execution.
Blocklist is applied first; allowlist by prefix second.
This is an internal validation tool for the Action Runtime.
Terminal is NOT the product focus — it validates the pipeline only.
"""

from __future__ import annotations

import logging
import re
import subprocess

from planner.models import ToolResult

_MAX_TIMEOUT = 10       # seconds — hard cap, ignores backend value if higher
_MAX_OUTPUT  = 2000     # chars of stdout
_MAX_STDERR  = 300      # chars of stderr

# Prefixes of commands allowed in Phase 3A (read-only, no file reading)
ALLOWLIST_PREFIXES: tuple[str, ...] = (
    "pwd",
    "whoami",
    "hostname",
    "date",
    "ver",
    "systeminfo",
    "ipconfig",
    "tasklist",
    "git status",
    "git --version",
    "node --version",
    "python --version",
    "python3 --version",
    "npm --version",
    "dir",
    "ls",
)

# Patterns that are always blocked — applied before allowlist
BLOCKLIST_PATTERNS: tuple[str, ...] = (
    # write / destroy
    ">", ">>", "rm", "del", "rmdir", "mv", "move", "cp", "copy",
    "mkdir", "md", "touch", "format", "mkfs",
    # file reading — explicitly blocked Phase 3A
    "cat", "type", "head", "tail", "more", "less",
    "grep", "findstr", "find", "wc", "du",
    # network download
    "curl", "wget", "invoke-webrequest", "invoke-restmethod",
    # package install
    "pip install", "npm install", "yarn add", "choco", "winget install",
    # elevation
    "sudo", "runas", "chmod", "chown", "attrib", "icacls",
    # chaining / injection
    "&&", "||", ";", "|", "$(", "`",
    # nested shells
    "cmd", "powershell", "bash", "sh",
    "python -c", "python3 -c", "node -e", "eval", "exec",
    # system / services
    "shutdown", "restart", "reboot",
    "taskkill", "kill",
    "sc ", "net start", "net stop",
    "reg ", "regedit",
    "hkey_", "hklm", "hkcu",
    # sensitive paths / content
    ".ssh", "id_rsa", ".env", "credentials",
    "password", "passwd", "secret", "token", "api_key",
)

# Sanity regex — catches shell metacharacters that slip through
_UNSAFE_CHARS = re.compile(r"[|;&`$()<>!]")


def _is_safe(command: str) -> tuple[bool, str]:
    """Return (safe, reason). Blocklist first, then allowlist by prefix."""
    normalized = command.strip().lower()

    # blocklist check
    for pattern in BLOCKLIST_PATTERNS:
        if pattern.lower() in normalized:
            return False, f"Patrón bloqueado: '{pattern}'"

    # shell metacharacter sanity check
    if _UNSAFE_CHARS.search(normalized):
        return False, "Caracteres especiales no permitidos"

    # allowlist prefix check
    for prefix in ALLOWLIST_PREFIXES:
        pl = prefix.lower()
        if normalized == pl or normalized.startswith(pl + " "):
            return True, ""

    return False, "Comando no está en la lista permitida"


def run_command(params: dict) -> ToolResult:
    """Execute a validated read-only command and return its output."""
    command = params.get("command", "")
    if not isinstance(command, str):
        return ToolResult(ok=False, output="", error="Comando inválido.")
    command = command.strip()
    if not command:
        return ToolResult(ok=False, output="", error="Comando vacío.")

    safe, reason = _is_safe(command)
    if not safe:
        logging.warning("[terminal] BLOCKED cmd=%r reason=%s", command, reason)
        return ToolResult(ok=False, output="", error=f"Comando bloqueado: {reason}")

    timeout = min(int(params.get("timeout_secs", _MAX_TIMEOUT)), _MAX_TIMEOUT)

    try:
        proc = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        stdout = proc.stdout or ""
        stderr = proc.stderr or ""
        truncated = len(stdout) > _MAX_OUTPUT

        output = stdout[:_MAX_OUTPUT]
        if truncated:
            output += "\n[... salida truncada]"
        if stderr.strip():
            output += f"\n[stderr]: {stderr[:_MAX_STDERR].strip()}"

        logging.info("[terminal] cmd=%r rc=%d out_len=%d", command, proc.returncode, len(stdout))
        return ToolResult(
            ok=proc.returncode == 0,
            output=output.strip(),
            returncode=proc.returncode,
        )

    except subprocess.TimeoutExpired:
        logging.warning("[terminal] timeout cmd=%r", command)
        return ToolResult(ok=False, output="", error="El comando excedió el tiempo límite.")
    except Exception as exc:
        logging.error("[terminal] error cmd=%r exc=%s", command, exc)
        return ToolResult(ok=False, output="", error="Error al ejecutar el comando.")
