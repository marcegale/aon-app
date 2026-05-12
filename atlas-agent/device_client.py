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
    registration_url: Optional[str] = None
    expires_at: Optional[str] = None
    poll_interval_secs: Optional[int] = None
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

    def start_registration(
        self,
        device_code: str,
        platform: str = "windows",
        client_version: Optional[str] = None,
    ) -> StartResult:
        body: dict = {"device_code": device_code, "platform": platform}
        if client_version is not None:
            body["client_version"] = client_version
        try:
            code, resp = self._post_json("/api/atlas/devices/register/start", body)
            if code == 200:
                return StartResult(
                    ok=True,
                    registration_url=resp.get("registration_url"),
                    expires_at=resp.get("expires_at"),
                    poll_interval_secs=resp.get("poll_interval_secs"),
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
            code, body = self._post_json("/api/atlas/devices/register/poll", {"device_code": device_code})
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
