"""
Atlas Desktop — Background registration poll loop.

Starts a daemon thread that polls the backend until the device is approved,
expired, or denied.

On approval: save_device_key_fn is called exactly once (by DeviceRegistrationFlow
internally). The polling module never calls it directly.
On completion: the appropriate PollingCallbacks method is invoked.

Does NOT:
- block the main thread
- log device_code or device_key
- touch the planner
- open a browser
"""
from __future__ import annotations

import threading
from dataclasses import dataclass
from typing import Callable, Optional

from device_client import AtlasDeviceClient
from device_credentials import save_device_key as _default_save_device_key
from device_registration import DeviceRegistrationFlow
from device_registration_startup import StartupRegistrationResult

_DEFAULT_INTERVAL: float = 5.0


@dataclass
class PollingCallbacks:
    on_status: Optional[Callable[[str], None]] = None
    on_registered: Optional[Callable[[], None]] = None
    on_failed: Optional[Callable[[str, str], None]] = None


@dataclass
class RegistrationPollingHandle:
    thread: threading.Thread
    device_code: str
    started: bool = True


def _default_flow_factory(
    client: AtlasDeviceClient,
    save_fn: Callable[[str], None],
) -> DeviceRegistrationFlow:
    return DeviceRegistrationFlow(client, save_fn=save_fn)


def start_registration_polling(
    startup_registration: StartupRegistrationResult,
    backend_url: str,
    save_device_key_fn: Callable[[str], None] = _default_save_device_key,
    callbacks: Optional[PollingCallbacks] = None,
    flow_factory: Optional[Callable] = None,
    interval_seconds: Optional[float] = None,
    max_polls: int = 180,
) -> Optional[RegistrationPollingHandle]:
    """
    Start a background daemon thread that polls for device registration approval.

    Parameters
    ----------
    startup_registration:
        Result from maybe_start_registration_from_startup_check(). Must have
        started=True and a non-empty device_code to proceed.
    backend_url:
        Base URL of the Atlas backend.
    save_device_key_fn:
        Called with the approved device key. DeviceRegistrationFlow calls it
        exactly once on approval — this module never calls it directly.
    callbacks:
        Optional PollingCallbacks for on_status / on_registered / on_failed.
    flow_factory:
        Injectable factory: (client, save_fn) -> flow object.
        flow object must implement run_poll_loop(device_code, ...).
        Defaults to DeviceRegistrationFlow.
    interval_seconds:
        Override the poll interval. Falls back to startup_registration.poll_interval_secs,
        then _DEFAULT_INTERVAL (5.0s).
    max_polls:
        Maximum number of poll attempts before giving up (default 180 = 15 min at 5s).

    Returns
    -------
    RegistrationPollingHandle if polling started, None otherwise. Never raises.
    """
    if not startup_registration.started:
        return None

    device_code = startup_registration.device_code
    if not device_code:
        if callbacks and callbacks.on_failed:
            callbacks.on_failed("INVALID_REGISTRATION", "No device code available.")
        return None

    if not backend_url:
        if callbacks and callbacks.on_failed:
            callbacks.on_failed("BACKEND_URL_MISSING", "Backend URL is not configured.")
        return None

    interval = (
        interval_seconds
        if interval_seconds is not None
        else float(startup_registration.poll_interval_secs or _DEFAULT_INTERVAL)
    )

    _factory = flow_factory if flow_factory is not None else _default_flow_factory
    client = AtlasDeviceClient(backend_url)
    flow = _factory(client, save_device_key_fn)
    cbs = callbacks or PollingCallbacks()

    def _run() -> None:
        result = flow.run_poll_loop(
            device_code,
            interval_seconds=interval,
            max_polls=max_polls,
            on_status=cbs.on_status,
        )
        if result is not None:
            if cbs.on_registered:
                cbs.on_registered()
        else:
            if cbs.on_failed:
                cbs.on_failed("REGISTRATION_NOT_COMPLETED", "Registration did not complete.")

    t = threading.Thread(target=_run, daemon=True)
    t.start()
    return RegistrationPollingHandle(thread=t, device_code=device_code)
