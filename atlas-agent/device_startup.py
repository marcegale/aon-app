"""
Atlas Desktop — Startup device state wiring.

Wraps resolve_startup_device_state() with startup-specific decisions:
  - should_start_registration: whether the UI should kick off registration
  - should_allow_planner:      whether the planner should be gated
  - user_message:              human-readable, non-sensitive status text

The raw device_key is never stored, logged, or included in any output field.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Optional

from device_auth_client import AtlasDeviceAuthClient
from device_credentials import clear_device_key, load_device_key
from device_state import DeviceState, DeviceStateResult, resolve_startup_device_state


@dataclass
class StartupDeviceCheck:
    result: DeviceStateResult
    should_start_registration: bool
    should_allow_planner: bool
    user_message: str


def dev_only_accept_existing_key_validator(_device_key: str) -> dict:
    """
    Fallback validator that unconditionally accepts any stored key.

    No network call is made.  Use only when BACKEND_URL is unavailable
    (e.g. dev environment without a running backend).
    """
    return {"ok": True}


def make_backend_device_key_validator(
    backend_url: str,
    timeout_seconds: float = 10.0,
) -> Callable[[str], dict]:
    """Return a validator bound to the given backend URL via AtlasDeviceAuthClient."""
    client = AtlasDeviceAuthClient(backend_url, timeout_seconds)
    return client.validate_device_key


def run_startup_device_check(
    validate_device_key_fn: Callable[[str], dict],
    load_device_key_fn: Callable[[], Optional[str]] = load_device_key,
    clear_device_key_fn: Callable[[], None] = clear_device_key,
) -> StartupDeviceCheck:
    """
    Run the startup device state machine and return actionable startup flags.

    Parameters mirror resolve_startup_device_state(); all are injectable for
    testing.  The raw device_key never appears in any returned field.
    """
    result = resolve_startup_device_state(
        load_device_key_fn=load_device_key_fn,
        clear_device_key_fn=clear_device_key_fn,
        validate_device_key_fn=validate_device_key_fn,
    )

    state = result.state

    if state == DeviceState.REGISTERED:
        return StartupDeviceCheck(
            result=result,
            should_start_registration=False,
            should_allow_planner=True,
            user_message="Atlas device registered.",
        )
    if state == DeviceState.UNREGISTERED:
        return StartupDeviceCheck(
            result=result,
            should_start_registration=True,
            should_allow_planner=False,
            user_message="Atlas device is not registered.",
        )
    if state == DeviceState.REVOKED:
        return StartupDeviceCheck(
            result=result,
            should_start_registration=True,
            should_allow_planner=False,
            user_message="Atlas device was revoked. Registration required.",
        )
    if state == DeviceState.AUTH_FAILED:
        return StartupDeviceCheck(
            result=result,
            should_start_registration=True,
            should_allow_planner=False,
            user_message="Atlas device authentication failed.",
        )
    # OFFLINE (and any future unrecognised state)
    return StartupDeviceCheck(
        result=result,
        should_start_registration=False,
        should_allow_planner=False,
        user_message="Atlas backend unavailable. Atlas is offline.",
    )
