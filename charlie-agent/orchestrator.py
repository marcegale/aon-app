from __future__ import annotations

from typing import Any, Dict, List

from .command_catalog import build_catalog
from .executors.apps import exec_open_app
from .executors.notes import exec_save_note
from .executors.whatsapp import exec_send_whatsapp_message
from .planner import build_action_plan


CATALOG = build_catalog(
    exec_open_app=exec_open_app,
    exec_send_whatsapp_message=exec_send_whatsapp_message,
    exec_save_note=exec_save_note,
)
CATALOG_BY_ID = {cmd.id: cmd for cmd in CATALOG}


class PendingActionStore:
    def __init__(self):
        self.pending: Dict[str, Any] | None = None

    def set(self, plan: Dict[str, Any]) -> None:
        self.pending = plan

    def pop(self) -> Dict[str, Any] | None:
        value = self.pending
        self.pending = None
        return value

    def has_pending(self) -> bool:
        return self.pending is not None


PENDING_STORE = PendingActionStore()


AFFIRMATIVE = {"si", "sí", "dale", "ok", "de una", "confirmo", "envialo", "envíalo"}
NEGATIVE = {"no", "cancelá", "cancela", "mejor no"}


def summarize_results(results: List[Dict[str, Any]]) -> str:
    ok_results = [r for r in results if r.get("ok")]
    failed = [r for r in results if not r.get("ok")]

    parts: List[str] = []
    for result in ok_results:
        if result["action"] == "open_app":
            parts.append(f"Abrí {result['resolved_app']}")
        elif result["action"] == "send_whatsapp_message":
            parts.append(f"Preparé el mensaje para {result['resolved_contact']}")
        elif result["action"] == "save_note":
            parts.append("Guardé la nota")

    for result in failed:
        parts.append(result.get("error", "Hubo un problema."))

    return ". ".join(parts) if parts else "No hice ningún cambio."


def execute_plan(plan: Dict[str, Any]) -> List[Dict[str, Any]]:
    results = []
    for step in plan["steps"]:
        command = CATALOG_BY_ID.get(step["action"])
        if not command:
            results.append({"ok": False, "action": step["action"], "error": f"Acción no soportada: {step['action']}"})
            continue
        result = command.executor(step["arguments"])
        results.append(result)
    return results

def process_user_command(text: str) -> Dict[str, Any]:
    normalized = text.strip().lower()

    if PENDING_STORE.has_pending():
        if normalized in AFFIRMATIVE:
            plan = PENDING_STORE.pop()
            results = execute_plan(plan)
            return {
                "handled": True,
                "status": "executed_confirmed_plan",
                "results": results,
                "speak": summarize_results(results),
            }
        if normalized in NEGATIVE:
            PENDING_STORE.pop()
            return {
                "handled": True,
                "status": "cancelled_pending_plan",
                "results": [],
                "speak": "Entendido. Cancelé la acción pendiente.",
            }

    plan = build_action_plan(text)

    if not plan["steps"]:
        return {
            "handled": False,
            "status": "no_action_detected",
            "results": [],
            "speak": None,
            "plan": plan,
        }

    if plan["missing_information"]:
        return {
            "handled": True,
            "status": "missing_information",
            "results": [],
            "speak": ". ".join(plan["missing_information"]),
            "plan": plan,
        }

    if plan["needs_confirmation"]:
        immediate_steps = []
        pending_steps = []

        for step in plan["steps"]:
            if step["action"] == "open_app":
                immediate_steps.append(step)
            else:
                pending_steps.append(step)

        immediate_results = []
        if immediate_steps:
            immediate_results = execute_plan({"steps": immediate_steps})

        if pending_steps:
            pending_plan = {
                "goal": plan["goal"],
                "steps": pending_steps,
                "missing_information": [],
                "needs_confirmation": True,
            }
            PENDING_STORE.set(pending_plan)

        previews = []
        for step in pending_steps:
            if step["action"] == "send_whatsapp_message":
                previews.append(
                    f"mensaje a {step['arguments']['contact_name']}: \"{step['arguments']['message']}\""
                )

        base_speak = summarize_results(immediate_results) if immediate_results else ""
        confirm_speak = (" ¿Confirmás el resto?" if previews else "").strip()

        if previews and base_speak:
            speak = f"{base_speak}. Voy a preparar " + " y luego ".join(previews) + ". ¿Confirmás?"
        elif previews:
            speak = "Voy a preparar " + " y luego ".join(previews) + ". ¿Confirmás?"
        else:
            speak = base_speak or "Listo."

        return {
            "handled": True,
            "status": "awaiting_confirmation",
            "results": immediate_results,
            "speak": speak,
            "plan": plan,
        }

    results = execute_plan(plan)
    return {
        "handled": True,
        "status": "executed_immediately",
        "results": results,
        "speak": summarize_results(results),
        "plan": plan,
    }