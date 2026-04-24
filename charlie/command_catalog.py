from dataclasses import dataclass
from typing import Any, Callable, Dict, List


@dataclass
class CommandSpec:
    id: str
    title: str
    description: str
    examples: List[str]
    parameters: Dict[str, Any]
    requires_confirmation: bool
    executor: Callable[[Dict[str, Any]], Dict[str, Any]]
    aliases: List[str]


def build_catalog(exec_open_app, exec_send_whatsapp_message, exec_save_note):
    return [
        CommandSpec(
            id="open_app",
            title="Abrir aplicación",
            description="Abre una aplicación instalada en el sistema operativo.",
            examples=[
                "abrí chrome",
                "abre whatsapp",
                "quiero abrir visual studio code",
            ],
            parameters={
                "app_name": {"type": "string", "required": True},
            },
            requires_confirmation=False,
            executor=exec_open_app,
            aliases=["abrir app", "abrir aplicación", "open app", "launch app"],
        ),
        CommandSpec(
            id="send_whatsapp_message",
            title="Enviar mensaje por WhatsApp",
            description=(
                "Abre WhatsApp Web o Desktop con un chat resuelto por contacto y un mensaje precargado. "
                "Por seguridad, conviene confirmar antes del envío final."
            ),
            examples=[
                "mandale un whatsapp a Juan",
                "escribile a Juan Pérez por whatsapp que voy tarde",
                "avisale por whatsapp a Juan que no llego a la reunión",
            ],
            parameters={
                "contact_name": {"type": "string", "required": True},
                "message": {"type": "string", "required": True},
                "auto_send": {"type": "boolean", "required": False, "default": False},
            },
            requires_confirmation=True,
            executor=exec_send_whatsapp_message,
            aliases=["mandar whatsapp", "enviar whatsapp", "whatsapp", "mensaje whatsapp"],
        ),
        CommandSpec(
            id="save_note",
            title="Guardar nota",
            description="Guarda una nota de texto en un archivo local.",
            examples=[
                "guarda nota comprar cables usb-c",
                "anota que el jueves tengo médico",
            ],
            parameters={
                "content": {"type": "string", "required": True},
            },
            requires_confirmation=False,
            executor=exec_save_note,
            aliases=["guardar nota", "anotar", "save note"],
        ),
    ]
