"""Declarative capability registry — single source of truth for all Atlas tools.

availability:
  "enabled" — registered in executor, can be executed
  "stub"    — declared, not executable; executor returns CAPABILITY_UNAVAILABLE
  "disabled"— explicitly off (future feature flags)

Permission levels are assigned conservatively: any operation with external
side-effects or irreversibility is SENSITIVE or DESTRUCTIVE from birth.
"""

from __future__ import annotations

from capabilities.models import Capability, CapabilityOperation

_S  = CapabilityOperation   # alias for brevity

REGISTRY: dict[str, Capability] = {

    "terminal": Capability(
        id="terminal",
        display_name="Terminal",
        category="system",
        availability="enabled",
        requires_local_runtime=False,
        requires_external_auth=False,
        operations=[
            _S("run_command", "Ejecutar comando", "SENSITIVE"),
        ],
    ),

    "local_agent": Capability(
        id="local_agent",
        display_name="Agente local",
        category="agent",
        availability="stub",
        requires_local_runtime=True,
        requires_external_auth=False,
        unavailable_reason="Los agentes locales no están disponibles todavía.",
        operations=[
            _S("invoke", "Invocar agente", "SENSITIVE"),
        ],
    ),

    "browser": Capability(
        id="browser",
        display_name="Navegador",
        category="browser",
        availability="stub",
        requires_local_runtime=False,
        requires_external_auth=False,
        unavailable_reason="El control de navegador no está disponible todavía.",
        operations=[
            _S("open_url", "Abrir URL", "SENSITIVE"),
        ],
    ),

    "web_operator": Capability(
        id="web_operator",
        display_name="Operador web",
        category="browser",
        availability="stub",
        requires_local_runtime=False,
        requires_external_auth=False,
        unavailable_reason="El operador web no está disponible todavía.",
        operations=[
            _S("open_agent_page", "Abrir página de agente", "SENSITIVE"),
            _S("guide_steps",     "Guiar pasos en navegador", "SENSITIVE"),
        ],
    ),

    "email": Capability(
        id="email",
        display_name="Email",
        category="communication",
        availability="stub",
        requires_local_runtime=False,
        requires_external_auth=True,
        unavailable_reason="El email no está disponible todavía.",
        operations=[
            _S("send_message", "Enviar email",       "DESTRUCTIVE", is_destructive=True),
            _S("read_inbox",   "Leer bandeja entrada", "SENSITIVE"),
        ],
    ),

    "messages": Capability(
        id="messages",
        display_name="Mensajes",
        category="communication",
        availability="stub",
        requires_local_runtime=False,
        requires_external_auth=True,
        unavailable_reason="Los mensajes no están disponibles todavía.",
        operations=[
            _S("send_message", "Enviar mensaje", "DESTRUCTIVE", is_destructive=True),
        ],
    ),

    "files": Capability(
        id="files",
        display_name="Archivos",
        category="file",
        availability="stub",
        requires_local_runtime=False,
        requires_external_auth=False,
        unavailable_reason="El acceso a archivos no está disponible todavía.",
        operations=[
            _S("read_file",  "Leer archivo",     "SENSITIVE"),
            _S("write_file", "Escribir archivo",  "DESTRUCTIVE", is_destructive=True),
        ],
    ),

    "apps": Capability(
        id="apps",
        display_name="Aplicaciones",
        category="app",
        availability="stub",
        requires_local_runtime=False,
        requires_external_auth=False,
        unavailable_reason="El control de aplicaciones no está disponible todavía.",
        operations=[
            _S("open_app",  "Abrir aplicación",  "SENSITIVE"),
            _S("close_app", "Cerrar aplicación",  "SENSITIVE"),
        ],
    ),

    "calendar": Capability(
        id="calendar",
        display_name="Calendario",
        category="app",
        availability="stub",
        requires_local_runtime=False,
        requires_external_auth=True,
        unavailable_reason="El calendario no está disponible todavía.",
        operations=[
            _S("read_events",   "Leer eventos",   "SENSITIVE"),
            _S("create_event",  "Crear evento",   "DESTRUCTIVE", is_destructive=True),
        ],
    ),
}
