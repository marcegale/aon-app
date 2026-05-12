"""
Atlas Desktop — Startup device state machine.

Resolves the device registration state at startup by:
  1. loading the locally stored device_key
  2. validating it against an injected validator (no real network in this module)
  3. returning a DeviceStateResult describing the outcome

All dependencies are injected — no real keyring, no real backend calls here.
The raw device_key is never logged or printed.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Callable, Optional


class DeviceState(str, Enum):
    UNREGISTERED = "unregistered"
    REGISTERED = "registered"
    REVOKED = "revoked"
    AUTH_FAILED = "auth_failed"
    OFFLINE = "offline"


@dataclass
class DeviceStateResult:
    state: DeviceState
    device_key_present: bool
    message: str = ""
    error_code: str | None = None


def resolve_startup_device_state(
    load_device_key_fn: Callable[[], Optional[str]],
    clear_device_key_fn: Callable[[], None],
    validate_device_key_fn: Callable[[str], dict],
) -> DeviceStateResult:
    """
    Determine the device registration state at startup.

    Parameters
    ----------
    load_device_key_fn:
        Returns the stored device_key string, or None if absent.
        May raise on credential-store failure.
    clear_device_key_fn:
        Removes the stored device_key. Called only on DEVICE_REVOKED.
        May raise; failure is recorded in error_code but does not change state.
    validate_device_key_fn:
        Accepts the device_key and returns a dict with at minimum {"ok": bool}.
        On failure: {"ok": False, "code": "<ERROR_CODE>"}.
        May raise on network/timeout; treated as OFFLINE.
    """
    # ── Step 1: load key ──────────────────────────────────────────────────────
    try:
        device_key = load_device_key_fn()
    except Exception:
        return DeviceStateResult(
            state=DeviceState.AUTH_FAILED,
            device_key_present=False,
            message="Failed to load device key from credential store.",
            error_code="CREDENTIAL_STORE_ERROR",
        )

    # ── Step 2: no key → unregistered ────────────────────────────────────────
    if not device_key:
        return DeviceStateResult(
            state=DeviceState.UNREGISTERED,
            device_key_present=False,
            message="No device key found.",
        )

    # ── Step 3: validate key ──────────────────────────────────────────────────
    try:
        validation = validate_device_key_fn(device_key)
    except Exception:
        return DeviceStateResult(
            state=DeviceState.OFFLINE,
            device_key_present=True,
            message="Validation request failed.",
            error_code="NETWORK_ERROR",
        )

    # ── Step 4: dispatch on validation result ─────────────────────────────────
    if validation.get("ok"):
        return DeviceStateResult(
            state=DeviceState.REGISTERED,
            device_key_present=True,
            message="Device key is valid.",
        )

    code: str = validation.get("code") or "UNKNOWN"

    if code == "DEVICE_REVOKED":
        clear_error: str | None = None
        try:
            clear_device_key_fn()
        except Exception:
            clear_error = "CLEAR_DEVICE_KEY_FAILED"
        return DeviceStateResult(
            state=DeviceState.REVOKED,
            device_key_present=False,
            message="Device key has been revoked.",
            error_code=clear_error,
        )

    if code == "INVALID_DEVICE_KEY":
        return DeviceStateResult(
            state=DeviceState.AUTH_FAILED,
            device_key_present=True,
            message="Device key is invalid.",
            error_code=code,
        )

    if code in ("NETWORK_ERROR", "DEVICE_AUTH_UNAVAILABLE"):
        return DeviceStateResult(
            state=DeviceState.OFFLINE,
            device_key_present=True,
            message="Authentication service unavailable.",
            error_code=code,
        )

    # Unknown error code → AUTH_FAILED
    return DeviceStateResult(
        state=DeviceState.AUTH_FAILED,
        device_key_present=True,
        message="Authentication failed with unknown error.",
        error_code=code,
    )
