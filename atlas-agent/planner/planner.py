import json
import logging
import urllib.request
import urllib.error
from typing import Any

import config.settings as settings

_TIMEOUT = 30
_MAX_PROMPT = 8000


def plan(prompt: str, context: dict[str, Any] | None = None) -> dict[str, Any]:
    """POST /api/atlas/plan — returns { ok, response?, mode?, error? }.

    Uses stdlib urllib; no extra dependencies.
    Desktop never holds AI API keys — all auth lives server-side.
    """
    prompt = prompt.strip()
    if not prompt:
        return {"ok": False, "error": {"code": "INVALID_PROMPT", "message": "Prompt vacío."}}
    if len(prompt) > _MAX_PROMPT:
        return {"ok": False, "error": {"code": "PROMPT_TOO_LONG", "message": "Prompt demasiado largo."}}

    if not settings.BACKEND_URL:
        logging.error("[planner] BACKEND_URL no configurado")
        return {"ok": False, "error": {"code": "INTERNAL_ERROR", "message": "BACKEND_URL no configurado."}}
    if not settings.DEVICE_KEY:
        logging.error("[planner] ATLAS_DEVICE_KEY no configurado")
        return {"ok": False, "error": {"code": "INTERNAL_ERROR", "message": "ATLAS_DEVICE_KEY no configurado."}}

    payload: dict[str, Any] = {"device_key": settings.DEVICE_KEY, "prompt": prompt}
    if context:
        payload["context"] = context

    url = f"{settings.BACKEND_URL}/api/atlas/plan"
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    logging.info("[planner] POST %s — prompt_len=%d", url, len(prompt))

    try:
        with urllib.request.urlopen(req, timeout=_TIMEOUT) as resp:
            raw = resp.read().decode("utf-8")
        result = json.loads(raw)
        logging.info("[planner] response ok=%s mode=%s", result.get("ok"), result.get("mode"))
        return result
    except urllib.error.HTTPError as exc:
        try:
            raw = exc.read().decode("utf-8")
            result = json.loads(raw)
            logging.error("[planner] HTTP %d: code=%s", exc.code, result.get("error", {}).get("code"))
            return result
        except Exception:
            logging.error("[planner] HTTP %d unreadable", exc.code)
            return {"ok": False, "error": {"code": "INTERNAL_ERROR", "message": f"HTTP {exc.code}"}}
    except urllib.error.URLError as exc:
        logging.error("[planner] URLError: %s", exc.reason)
        return {"ok": False, "error": {"code": "AI_UNAVAILABLE", "message": "No se pudo conectar al backend."}}
    except Exception as exc:
        logging.error("[planner] error inesperado: %s", exc)
        return {"ok": False, "error": {"code": "INTERNAL_ERROR", "message": str(exc)}}
