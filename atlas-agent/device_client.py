"""
Atlas Desktop — HTTP client for the registration API.
Uses stdlib only: urllib.request, json, dataclasses.
"""
from __future__ import annotations

import json
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Optional


@dataclass
class ClientError:
    code: str     # "NETWORK_ERROR" | "HTTP_ERROR" | "INVALID_RESPONSE"
    message: str


@dataclass
class StartResult:
    ok: bool
    device_code: Optional[str] = None
    pickup_id: Optional[str] = None
    expires_in: Optional[int] = None
    error: Optional[ClientError] = None


@dataclass
class PollResult:
    ok: bool
    status: Optional[str] = None
    device_key: Optional[str] = None
    error: Optional[ClientError] = None


class AtlasDeviceClient:
    def __init__(self, base_url: str, timeout: float = 10.0) -> None:
        self._base_url = base_url.rstrip("/")
        self._timeout = timeout

    def _post_json(self, path: str, body: dict) -> tuple[int, dict]:
        url = self._base_url + path
        payload = json.dumps(body).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=self._timeout) as resp:
            return resp.getcode(), json.loads(resp.read().decode("utf-8"))

    def _parse_http_error(self, exc: urllib.error.HTTPError) -> ClientError:
        try:
            body = json.loads(exc.read().decode("utf-8"))
            msg = body.get("error", f"HTTP {exc.code}")
        except Exception:
            msg = f"HTTP {exc.code}"
        return ClientError(code="HTTP_ERROR", message=msg)

    def start_registration(self, device_id: str) -> StartResult:
        try:
            code, body = self._post_json("/api/atlas/register/start", {"device_id": device_id})
            if code == 200:
                return StartResult(
                    ok=True,
                    device_code=body.get("device_code"),
                    pickup_id=body.get("pickup_id"),
                    expires_in=body.get("expires_in"),
                )
            return StartResult(ok=False, error=ClientError("HTTP_ERROR", f"HTTP {code}"))
        except urllib.error.HTTPError as exc:
            return StartResult(ok=False, error=self._parse_http_error(exc))
        except urllib.error.URLError as exc:
            return StartResult(ok=False, error=ClientError("NETWORK_ERROR", str(exc.reason)))
        except (json.JSONDecodeError, ValueError) as exc:
            return StartResult(ok=False, error=ClientError("INVALID_RESPONSE", str(exc)))

    def poll_registration(self, device_code: str) -> PollResult:
        try:
            code, body = self._post_json("/api/atlas/register/pickup", {"device_code": device_code})
            if code == 200:
                return PollResult(
                    ok=True,
                    status=body.get("status"),
                    device_key=body.get("device_key"),
                )
            return PollResult(ok=False, error=ClientError("HTTP_ERROR", f"HTTP {code}"))
        except urllib.error.HTTPError as exc:
            return PollResult(ok=False, error=self._parse_http_error(exc))
        except urllib.error.URLError as exc:
            return PollResult(ok=False, error=ClientError("NETWORK_ERROR", str(exc.reason)))
        except (json.JSONDecodeError, ValueError) as exc:
            return PollResult(ok=False, error=ClientError("INVALID_RESPONSE", str(exc)))
