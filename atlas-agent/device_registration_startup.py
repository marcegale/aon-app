"""
Atlas Desktop — Startup registration trigger.

When the startup device check indicates registration is needed,
this module starts the registration flow:
  1. generate a device_code (internally, inside DeviceRegistrationFlow.start)
  2. call the registration start endpoint via DeviceRegistrationFlow
  3. return the result so the UI layer can display it

Does NOT: poll, save device_key, open browser, log device_code.
The raw device_code is never printed or written to logs here.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Optional

from device_client import AtlasDeviceClient
from device_registration import DeviceRegistrationFlow, RegistrationStarted, RegistrationFlowError
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


def _default_flow_factory(client: AtlasDeviceClient) -> DeviceRegistrationFlow:
    return DeviceRegistrationFlow(client)


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
        flow object must have: start(platform, client_version) -> RegistrationStarted | RegistrationFlowError
        Default uses DeviceRegistrationFlow directly.

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

    start_result = flow.start(platform=platform, client_version=client_version)

    if isinstance(start_result, RegistrationStarted):
        return StartupRegistrationResult(
            attempted=True,
            started=True,
            device_code=start_result.device_code,
            registration_url=start_result.registration_url,
            expires_at=start_result.expires_at,
            poll_interval_secs=start_result.poll_interval_secs,
            message="Registration started.",
        )

    # RegistrationFlowError
    return StartupRegistrationResult(
        attempted=True,
        started=False,
        error_code=start_result.code,
        message=start_result.message,
    )
