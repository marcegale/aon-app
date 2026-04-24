from __future__ import annotations

from pathlib import Path
from typing import Any, Dict


NOTES_PATH = Path("notas_charlie.txt")


def exec_save_note(args: Dict[str, Any]) -> Dict[str, Any]:
    content = args["content"].strip()
    if not content:
        return {"ok": False, "action": "save_note", "error": "La nota está vacía."}

    try:
        with NOTES_PATH.open("a", encoding="utf-8") as f:
            f.write(content + "\n")
        return {
            "ok": True,
            "action": "save_note",
            "saved_to": str(NOTES_PATH.resolve()),
            "content": content,
        }
    except Exception as exc:
        return {"ok": False, "action": "save_note", "error": str(exc)}
