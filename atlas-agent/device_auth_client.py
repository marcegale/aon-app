"""
Atlas Desktop — HTTP client for device key validation.

POSTs to /api/atlas/devices/auth/check and maps the response to the
dict contract expected by resolve_startup_device_state().
Uses stdlib only: urllib.request, json, dataclasses.
The raw device_key is never logged or stored.
"""
from __future__ import annotations

import json
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Optional


@dataclass
class DeviceAuthCheckResult:
    ok: bool
    code: Optional[str] = None
    message: str = ""
    http_status: Optional[int] = None


class AtlasDeviceAuthClient:
    _CHECK_PATH = "/api/atlas/devices/auth/check"

    def __init__(self, backend_url: str, timeout_seconds: float = 10.0) -> None:
        self.backend_url = backend_url.rstrip("/")
        self.timeout_seconds = timeout_seconds

    def validate_device_key(self, device_key: str) -> dict:
        """
        POST device_key to the auth-check endpoint.

        Returns a dict compatible with resolve_startup_device_state():
          {"ok": True}                                    — active
          {"ok": False, "code": "INVALID_DEVICE_KEY"}    — 401
          {"ok": False, "code": "DEVICE_REVOKED"}        — 401
          {"ok": False, "code": "DEVICE_AUTH_UNAVAILABLE"} — 503
          {"ok": False, "code": "NETWORK_ERROR"}         — URLError / timeout
          {"ok": False, "code": "INVALID_RESPONSE"}      — malformed JSON

        The raw device_key is never printed or logged by this method.
        """
        url = f"{self.backend_url}{self._CHECK_PATH}"
        payload = json.dumps({"device_key": device_key}).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        # Phase 1: network I/O — separating I/O errors from JSON errors
        try:
            with urllib.request.urlopen(req, timeout=self.timeout_seconds) as resp:
                raw = resp.read()
        except urllib.error.HTTPError as exc:
            return self._parse_http_error(exc)
        except (urllib.error.URLError, TimeoutError, OSError):
            return {"ok": False, "code": "NETWORK_ERROR"}

        # Phase 2: JSON parsing — success-path body
        try:
            body = json.loads(raw.decode("utf-8"))
        except (ValueError, json.JSONDecodeError):
            return {"ok": False, "code": "INVALID_RESPONSE"}

        if body.get("ok"):
            return {"ok": True}

        code = (body.get("error") or {}).get("code") or "INVALID_RESPONSE"
        return {"ok": False, "code": code}

    @staticmethod
    def _parse_http_error(exc: urllib.error.HTTPError) -> dict:
        try:
            body = json.loads(exc.read().decode("utf-8"))
            code = (body.get("error") or {}).get("code") or f"HTTP_{exc.code}"
        except Exception:
            code = f"HTTP_{exc.code}"
        return {"ok": False, "code": code}
