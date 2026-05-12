"""
Atlas Desktop — Registration retry/recovery.

Wraps a fresh registration start + poll for retry/recovery scenarios
(expired, denied, network failure, start failure, etc.).

Does NOT: open browser, log device_code/url/key, save device_key directly,
          block the caller (polling runs in a daemon thread).
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Optional

from device_registration_startup import (
    StartupRegistrationResult,
    maybe_start_registration_from_startup_check,
)
from device_registration_polling import PollingCallbacks, start_registration_polling


@dataclass
class RegistrationRetryResult:
    attempted: bool
    started: bool
    error_code: Optional[str] = None
    message: str = ""
    startup_registration: Optional[StartupRegistrationResult] = None


def retry_registration(
    startup_check,
    backend_url: str,
    callbacks: PollingCallbacks,
    client_version: Optional[str] = None,
    platform: str = "windows",
    start_fn: Callable = maybe_start_registration_from_startup_check,
    polling_fn: Callable = start_registration_polling,
) -> RegistrationRetryResult:
    """
    Restart the registration flow (start + poll) for retry/recovery.

    Calls start_fn to obtain a fresh device_code, then polling_fn to
    begin background polling.  Returns immediately; the poll runs in a
    daemon thread via polling_fn.

    Parameters
    ----------
    startup_check:
        StartupDeviceCheck with should_start_registration=True.
    backend_url:
        Atlas backend base URL.
    callbacks:
        PollingCallbacks — on_status, on_registered, on_failed wired to UI.
    client_version:
        Optional version string forwarded to the backend.
    platform:
        OS identifier forwarded to the backend (default "windows").
    start_fn:
        Injectable: (startup_check, backend_url, client_version, platform)
        -> StartupRegistrationResult.  Default: maybe_start_registration_from_startup_check.
    polling_fn:
        Injectable: (startup_registration, backend_url, callbacks) -> handle.
        Default: start_registration_polling.

    Returns
    -------
    RegistrationRetryResult — always; never raises.
    """
    reg = start_fn(startup_check, backend_url, client_version, platform)

    if not reg.started:
        code = reg.error_code or "REGISTRATION_START_FAILED"
        msg = reg.message or "Registration start failed."
        if callbacks and callbacks.on_failed:
            callbacks.on_failed(code, msg)
        return RegistrationRetryResult(
            attempted=True,
            started=False,
            error_code=code,
            message=msg,
        )

    polling_fn(
        startup_registration=reg,
        backend_url=backend_url,
        callbacks=callbacks,
    )

    return RegistrationRetryResult(
        attempted=True,
        started=True,
        startup_registration=reg,
    )
