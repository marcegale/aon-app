from __future__ import annotations

import re
from typing import Any, Dict, List

from .resolvers import normalize


APP_HINTS = [
    "chrome",
    "google chrome",
    "whatsapp",
    "whatsapp desktop",
    "vscode",
    "visual studio code",
    "descargas",
]


def split_compound_command(text: str) -> List[str]:
    raw_parts = re.split(r"\b(?:y|después|luego|además)\b", text, flags=re.IGNORECASE)
    parts = [p.strip(" ,.") for p in raw_parts if p.strip(" ,.")]
    return parts if parts else [text.strip()]


def extract_message_after_patterns(text: str) -> str | None:
    patterns = [
        r"(?:avisandole|avisándole|diciendole|diciéndole|que)\s+(.+)$",
        r"(?:mensaje|msg)\s+(.+)$",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            return match.group(1).strip(" .")
    return None


def extract_contact_name(text: str) -> str | None:
    patterns = [
        r"(?:mandale|enviale|escribile|avisale)\s+(?:un\s+mensaje\s+)?a\s+([a-záéíóúñA-ZÁÉÍÓÚÑ][\wáéíóúñA-ZÁÉÍÓÚÑ]*(?:\s+[a-záéíóúñA-ZÁÉÍÓÚÑ][\wáéíóúñA-ZÁÉÍÓÚÑ]*){0,3})",
        r"(?:mensaje|msg)\s+(?:a|para)\s+([a-záéíóúñA-ZÁÉÍÓÚÑ][\wáéíóúñA-ZÁÉÍÓÚÑ]*(?:\s+[a-záéíóúñA-ZÁÉÍÓÚÑ][\wáéíóúñA-ZÁÉÍÓÚÑ]*){0,3})",
        r"(?:a|para)\s+([a-záéíóúñA-ZÁÉÍÓÚÑ][\wáéíóúñA-ZÁÉÍÓÚÑ]*(?:\s+[a-záéíóúñA-ZÁÉÍÓÚÑ][\wáéíóúñA-ZÁÉÍÓÚÑ]*){0,3})",
    ]

    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            candidate = match.group(1).strip()
            candidate = re.sub(r"\b(?:diciendo|avisando|que)\b.*$", "", candidate, flags=re.IGNORECASE).strip()
            return candidate

    return None


def detect_open_app(text: str) -> Dict[str, Any] | None:
    n = normalize(text)
    open_triggers = ["abre", "abrime", "abrir", "abri", "lanza", "ejecuta", "open"]
    if not any(trigger in n for trigger in open_triggers):
        return None

    for app in APP_HINTS:
        if normalize(app) in n:
            return {"action": "open_app", "arguments": {"app_name": app}}

    m = re.search(r"(?:abre|abrime|abrir|abri|lanza|ejecuta)\s+(.+)$", text, flags=re.IGNORECASE)
    if m:
        candidate = m.group(1).strip(" .")
        candidate = re.split(r"\b(?:y|despues|después|luego)\b", candidate, maxsplit=1, flags=re.IGNORECASE)[0].strip()
        return {"action": "open_app", "arguments": {"app_name": candidate}}
    return None


def detect_whatsapp_message(text: str) -> Dict[str, Any] | None:
    n = normalize(text)

    explicit_whatsapp = "whatsapp" in n

    send_patterns = [
        "mandale",
        "manda mensaje",
        "manda un mensaje",
        "enviá mensaje",
        "envia mensaje",
        "envia un mensaje",
        "escribile",
        "escribi",
        "avisale",
        "avisa",
    ]

    has_send_intent = any(pattern in n for pattern in send_patterns)

    if not explicit_whatsapp and not has_send_intent:
        return None

    contact_name = extract_contact_name(text)
    message = extract_message_after_patterns(text)

    return {
        "action": "send_whatsapp_message",
        "arguments": {
            "contact_name": contact_name,
            "message": message,
            "auto_send": False,
        },
    }


def detect_save_note(text: str) -> Dict[str, Any] | None:
    n = normalize(text)
    if not any(trigger in n for trigger in ["guarda nota", "anota", "anotame", "nota"]):
        return None
    content = re.sub(r"^(guarda nota|anota|anotame)\s*", "", text, flags=re.IGNORECASE).strip()
    return {"action": "save_note", "arguments": {"content": content}}


def build_action_plan(text: str) -> Dict[str, Any]:
    parts = split_compound_command(text)
    steps: List[Dict[str, Any]] = []
    missing_information: List[str] = []

    for part in parts:
        for detector in (detect_open_app, detect_whatsapp_message, detect_save_note):
            step = detector(part)
            if not step:
                continue
            steps.append(step)
            if step["action"] == "send_whatsapp_message":
                if not step["arguments"].get("contact_name"):
                    missing_information.append("Falta el nombre del contacto")
                if not step["arguments"].get("message"):
                    missing_information.append("Falta el contenido del mensaje")
            if step["action"] == "save_note" and not step["arguments"].get("content"):
                missing_information.append("Falta el contenido de la nota")
            break

    needs_confirmation = any(step["action"] == "send_whatsapp_message" for step in steps)

    return {
        "goal": text,
        "steps": steps,
        "missing_information": missing_information,
        "needs_confirmation": needs_confirmation,
    }
