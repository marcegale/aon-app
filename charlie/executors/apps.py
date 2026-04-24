from __future__ import annotations

import os
import subprocess
from typing import Any, Dict, List


APP_REGISTRY = {
    "whatsapp": [
        {
            "type": "startapp",
            "target": "5319275A.WhatsAppDesktop_cv1g1gvanyjgm!App",
        },
        {
            "type": "path",
            "target": r"%LOCALAPPDATA%\WhatsApp\WhatsApp.exe",
        },
        {
            "type": "command",
            "target": "whatsapp",
        },
    ],
    "whatsapp desktop": [
        {
            "type": "startapp",
            "target": "5319275A.WhatsAppDesktop_cv1g1gvanyjgm!App",
        },
        {
            "type": "path",
            "target": r"%LOCALAPPDATA%\WhatsApp\WhatsApp.exe",
        },
    ],
    "chrome": [
        {
            "type": "path",
            "target": r"%ProgramFiles%\Google\Chrome\Application\chrome.exe",
        },
        {
            "type": "path",
            "target": r"%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe",
        },
        {
            "type": "command",
            "target": "chrome",
        },
    ],
    "google chrome": [
        {
            "type": "path",
            "target": r"%ProgramFiles%\Google\Chrome\Application\chrome.exe",
        },
        {
            "type": "path",
            "target": r"%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe",
        },
        {
            "type": "command",
            "target": "chrome",
        },
    ],
    "vscode": [
        {
            "type": "command",
            "target": "code",
        },
        {
            "type": "path",
            "target": r"%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe",
        },
    ],
    "visual studio code": [
        {
            "type": "command",
            "target": "code",
        },
        {
            "type": "path",
            "target": r"%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe",
        },
    ],
    "descargas": [
        {
            "type": "shell",
            "target": "shell:Downloads",
        }
    ],
}


def _expand(target: str) -> str:
    return os.path.expandvars(target)


def _try_launch(launcher: Dict[str, str]) -> tuple[bool, str | None]:
    launch_type = launcher["type"]
    raw_target = launcher["target"]
    target = _expand(raw_target)

    try:
        if launch_type == "path":
            if not os.path.exists(target):
                return False, f"ruta no encontrada: {target}"
            os.startfile(target)
            return True, None

        if launch_type == "command":
            subprocess.Popen(target, shell=True)
            return True, None

        if launch_type == "startapp":
            subprocess.run(
                [
                    "powershell",
                    "-Command",
                    f'Start-Process "shell:AppsFolder\\{target}"'
                ],
                check=True,
            )
            return True, None

        if launch_type == "shell":
            subprocess.Popen(f'explorer.exe {target}', shell=True)
            return True, None

        return False, f"tipo no soportado: {launch_type}"

    except Exception as exc:
        return False, str(exc)


def exec_open_app(args: Dict[str, Any]) -> Dict[str, Any]:
    app_name = args["app_name"].strip().lower()

    launchers: List[Dict[str, str]] | None = APP_REGISTRY.get(app_name)
    if not launchers:
        return {
            "ok": False,
            "action": "open_app",
            "error": f"No encontré la app: {app_name}",
        }

    errors: List[str] = []

    for launcher in launchers:
        ok, error = _try_launch(launcher)
        if ok:
            return {
                "ok": True,
                "action": "open_app",
                "resolved_app": app_name,
                "used_launcher": launcher["type"],
                "target": launcher["target"],
            }
        if error:
            errors.append(f'{launcher["type"]}: {error}')

    return {
        "ok": False,
        "action": "open_app",
        "error": f"No pude abrir {app_name}",
        "attempts": errors,
    }