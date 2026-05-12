"""
Atlas Desktop — Startup registration trigger.

When the startup device check indicates registration is needed,
this module starts the registration flow:
  1. generate a device_code
  2. call the registration start endpoint via DeviceRegistrationFlow
  3. return the result so the UI layer can display it

Does NOT: poll, save device_key, open browser, log device_code.
The raw device_code is never printed or written to logs here.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Optional

from device_client import AtlasDeviceClient
from device_registration import DeviceRegistrationFlow, generate_device_code
from device_startup import StartupDeviceCheck


@dataclass
class StartupRegistrationResult:
    attempted: bool
    started: bool
    device_code: str | None = None
    registration_url: str | None = None
    expires_at: str | None = None
    poll_interval_secs: int | None = None
    error_code: str | None = None
    message: str = ""


class _DefaultStartupFlow:
    """
    Adapts DeviceRegistrationFlow to the (platform, client_version) start API.

    Generates a fresh device_code internally so the caller never needs to
    manage it.  Returns a plain dict so downstream code stays dependency-free.
    """

    def __init__(self, client: AtlasDeviceClient) -> None:
        self._flow = DeviceRegistrationFlow(client)

    def start(self, platform: str, client_version: str | None = None) -> dict:
        device_code = generate_device_code()
        result = self._flow.start(device_code)
        if result.ok:
            return {
                "ok": True,
                "device_code": device_code,
                "registration_url": result.pickup_id,   # best available in current API
                "expires_at": None,                     # expires_in only; ISO not available
                "poll_interval_secs": None,
            }
        error = result.error
        return {
            "ok": False,
            "error_code": error.code if error else "UNKNOWN",
            "message": error.message if error else "Registration start failed.",
        }


def _default_flow_factory(client: AtlasDeviceClient) -> _DefaultStartupFlow:
    return _DefaultStartupFlow(client)


def maybe_start_registration_from_startup_check(
    startup_check: StartupDeviceCheck,
    backend_url: str,
    client_version: str | None = None,
    platform: str = "windows",
    flow_factory: Optional[Callable[[AtlasDeviceClient], Any]] = None,
) -> StartupRegistrationResult:
    """
    Attempt to start device registration when startup_check says it's needed.

    Parameters
    ----------
    startup_check:
        Result of run_startup_device_check().  Controls whether registration runs.
    backend_url:
        Base URL of the Atlas backend.  Required when registration is attempted.
    client_version:
        Optional version string sent to the backend.
    platform:
        OS/platform identifier sent to the backend (default "windows").
    flow_factory:
        Injectable factory: (client: AtlasDeviceClient) -> flow object.
        flow object must have: start(platform, client_version) -> dict
        Default uses _DefaultStartupFlow wrapping DeviceRegistrationFlow.

    Returns
    -------
    StartupRegistrationResult — always; never raises.
    """
    if not startup_check.should_start_registration:
        return StartupRegistrationResult(
            attempted=False,
            started=False,
            message="Registration not required.",
        )

    if not backend_url:
        return StartupRegistrationResult(
            attempted=True,
            started=False,
            error_code="BACKEND_URL_MISSING",
            message="Backend URL is not configured.",
        )

    _factory = flow_factory if flow_factory is not None else _default_flow_factory
    client = AtlasDeviceClient(backend_url)
    flow = _factory(client)

    start_dict: dict = flow.start(platform=platform, client_version=client_version)

    if start_dict.get("ok"):
        return StartupRegistrationResult(
            attempted=True,
            started=True,
            device_code=start_dict.get("device_code"),
            registration_url=start_dict.get("registration_url"),
            expires_at=start_dict.get("expires_at"),
            poll_interval_secs=start_dict.get("poll_interval_secs"),
            message="Registration started.",
        )

    return StartupRegistrationResult(
        attempted=True,
        started=False,
        error_code=start_dict.get("error_code") or "REGISTRATION_START_FAILED",
        message=start_dict.get("message") or "Registration start failed.",
    )
