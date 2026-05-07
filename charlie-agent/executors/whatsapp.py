from __future__ import annotations

import time
from typing import Any, Dict, List, Optional

import pyperclip
from pywinauto import Desktop
from pywinauto.keyboard import send_keys

from resolvers import resolve_contact_name


CONTACTS: List[Dict[str, Any]] = [
    {"name": "Mutti", "aliases": ["mutti", "mama", "mamá", "madre"], "phone": "595991260449"},
    {"name": "Juan Perez", "aliases": ["juan", "juan perez"], "phone": "5491100000001"},
    {"name": "Juan Carlos", "aliases": ["juan carlos", "jc"], "phone": "5491100000002"},
    {"name": "Ana Torres", "aliases": ["ana", "anita", "ana torres"], "phone": "5491100000003"},
]


def _find_whatsapp_window(timeout: float = 10.0):
    deadline = time.time() + timeout

    while time.time() < deadline:
        windows = Desktop(backend="uia").windows()
        for win in windows:
            try:
                title = (win.window_text() or "").lower()
                if "whatsapp" in title:
                    return win
            except Exception:
                continue
        time.sleep(0.4)

    return None


def _focus_window(win) -> None:
    win.set_focus()
    try:
        win.restore()
    except Exception:
        pass
    time.sleep(0.8)


def _safe_descendants(win):
    try:
        return win.descendants()
    except Exception:
        return []


def _find_search_box(win):
    candidates = _safe_descendants(win)

    # 1. Buscar Edit con texto conocido
    for c in candidates:
        try:
            if c.element_info.control_type == "Edit":
                name = (c.window_text() or "").lower()
                auto_id = (getattr(c.element_info, "automation_id", "") or "").lower()
                if (
                    "buscar" in name
                    or "search" in name
                    or "chat o iniciar uno nuevo" in name
                    or "iniciar uno nuevo" in name
                    or "searchtextbox" in auto_id
                ):
                    return c
        except Exception:
            continue

    # 2. Primer Edit visible y habilitado del panel izquierdo
    edit_candidates = []
    for c in candidates:
        try:
            if c.element_info.control_type == "Edit" and c.is_visible() and c.is_enabled():
                rect = c.rectangle()
                edit_candidates.append((rect.top, rect.left, c))
        except Exception:
            continue

    if edit_candidates:
        edit_candidates.sort(key=lambda x: (x[0], x[1]))
        return edit_candidates[0][2]

    return None


def _find_message_box(win):
    candidates = _safe_descendants(win)

    # 1. Buscar Edit/Document por texto o auto id
    for c in candidates:
        try:
            control_type = c.element_info.control_type
            name = (c.window_text() or "").lower()
            auto_id = (getattr(c.element_info, "automation_id", "") or "").lower()

            if control_type in ("Edit", "Document"):
                if (
                    "mensaje" in name
                    or "message" in name
                    or "escribe" in name
                    or "write" in name
                    or "input" in auto_id
                    or "compose" in auto_id
                ):
                    return c
        except Exception:
            continue

    # 2. Elegir el Edit/Document más abajo a la derecha
    box_candidates = []
    for c in candidates:
        try:
            if c.element_info.control_type in ("Edit", "Document") and c.is_visible() and c.is_enabled():
                rect = c.rectangle()
                area = max(1, (rect.right - rect.left) * (rect.bottom - rect.top))
                box_candidates.append((rect.bottom, rect.right, area, c))
        except Exception:
            continue

    if box_candidates:
        box_candidates.sort(key=lambda x: (x[0], x[1], x[2]), reverse=True)
        return box_candidates[0][3]

    return None


def _open_first_chat_result(win) -> bool:
    candidates = _safe_descendants(win)

    # Buscar lista / item visible del panel de resultados
    items = []
    for c in candidates:
        try:
            ct = c.element_info.control_type
            if ct in ("ListItem", "DataItem", "Text") and c.is_visible() and c.is_enabled():
                rect = c.rectangle()
                items.append((rect.top, rect.left, c))
        except Exception:
            continue

    if not items:
        return False

    items.sort(key=lambda x: (x[0], x[1]))

    for _, _, item in items:
        try:
            txt = (item.window_text() or "").strip()
            if txt:
                item.click_input()
                time.sleep(0.9)
                return True
        except Exception:
            continue

    return False


def _clear_and_type_search(search_box, contact_name: str) -> None:
    search_box.click_input()
    time.sleep(0.3)

    try:
        search_box.type_keys("^a{BACKSPACE}", set_foreground=True)
    except Exception:
        send_keys("^a{BACKSPACE}")
    time.sleep(0.2)

    pyperclip.copy(contact_name)
    send_keys("^v")
    time.sleep(1.2)


def _paste_message(message_box, message: str) -> None:
    message_box.click_input()
    time.sleep(0.3)
    pyperclip.copy(message)
    send_keys("^v")
    time.sleep(0.3)


def exec_send_whatsapp_message(args: Dict[str, Any]) -> Dict[str, Any]:
    contact_name = args["contact_name"].strip()
    message = args["message"].strip()
    auto_send = bool(args.get("auto_send", False))

    if not contact_name:
        return {
            "ok": False,
            "action": "send_whatsapp_message",
            "error": "Falta el nombre del contacto.",
        }

    if not message:
        return {
            "ok": False,
            "action": "send_whatsapp_message",
            "error": "Falta el mensaje.",
        }

    contact_match = resolve_contact_name(contact_name, CONTACTS)
    if not contact_match["ok"]:
        return {
            "ok": False,
            "action": "send_whatsapp_message",
            "error": contact_match["error"],
        }

    if contact_match["ambiguous"]:
        names = ", ".join(c["name"] for c in contact_match["candidates"][:3])
        return {
            "ok": False,
            "action": "send_whatsapp_message",
            "needs_disambiguation": True,
            "error": f"Encontré varios contactos parecidos: {names}.",
            "candidates": contact_match["candidates"],
        }

    contact = contact_match["resolved_contact"]

    try:
        win = _find_whatsapp_window()
        if not win:
            return {
                "ok": False,
                "action": "send_whatsapp_message",
                "error": "No encontré la ventana de WhatsApp abierta.",
            }

        _focus_window(win)

        # Cerrar overlays/eventuales diálogos
        send_keys("{ESC}")
        time.sleep(0.2)
        send_keys("{ESC}")
        time.sleep(0.2)

                # Enfocar WhatsApp
        _focus_window(win)

        # Cerrar overlays
        send_keys("{ESC}")
        time.sleep(0.3)
        send_keys("{ESC}")
        time.sleep(0.3)

        # Ir a la lista de chats (sidebar)
        send_keys("^1")  # WhatsApp shortcut: focus chats
        time.sleep(0.5)

        # Buscar contacto
        send_keys("^f")
        time.sleep(0.5)

        pyperclip.copy(contact["name"])
        send_keys("^v")
        time.sleep(1.2)

        # Abrir primer resultado
        send_keys("{DOWN}")
        time.sleep(0.3)
        send_keys("{ENTER}")
        time.sleep(1.0)

        # Escribir mensaje
        pyperclip.copy(message)
        send_keys("^v")
        time.sleep(0.3)

        if not _open_first_chat_result(win):
            return {
                "ok": False,
                "action": "send_whatsapp_message",
                "error": f"No pude abrir el chat de {contact['name']}.",
            }

        _focus_window(win)

        message_box = _find_message_box(win)
        if not message_box:
            return {
                "ok": False,
                "action": "send_whatsapp_message",
                "error": "No encontré la caja de mensaje.",
            }

        _paste_message(message_box, message)

        if auto_send:
            send_keys("{ENTER}")
            time.sleep(0.2)

        return {
            "ok": True,
            "action": "send_whatsapp_message",
            "resolved_contact": contact["name"],
            "phone": contact["phone"],
            "message": message,
            "auto_send": auto_send,
            "mode": "desktop_uia_automation",
        }

    except Exception as exc:
        return {
            "ok": False,
            "action": "send_whatsapp_message",
            "error": f"No pude automatizar WhatsApp Desktop para {contact['name']}: {exc}",
        }