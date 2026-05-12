"""
Atlas Desktop — OS Credential Store abstraction for the device_key.

device_key is the per-device, revocable credential used to authenticate
against /api/atlas/plan.  It is stored in the OS credential manager
(Windows Credential Manager, macOS Keychain, Linux Secret Service) via
keyring.  This module never logs or prints the raw key value.
"""

from __future__ import annotations

import os
from typing import Optional

SERVICE_NAME = "atlas-desktop"
DEVICE_KEY_NAME = "device_key"


class CredentialStoreError(Exception):
    """Raised when the OS credential store cannot be read or written."""


try:
    import keyring
    import keyring.errors
    _KEYRING_AVAILABLE = True
except ImportError:  # pragma: no cover
    _KEYRING_AVAILABLE = False


def load_device_key() -> Optional[str]:
    """
    Load the device key from the OS credential store.

    Falls back to the ATLAS_DEV_DEVICE_KEY environment variable when keyring
    is unavailable or returns nothing.  Returns None if neither source has a
    value.  The key value is never logged.
    """
    if _KEYRING_AVAILABLE:
        try:
            value = keyring.get_password(SERVICE_NAME, DEVICE_KEY_NAME)
            if value:
                return value
        except Exception:
            pass  # Any backend error → fall through to env var

    env_value = os.getenv("ATLAS_DEV_DEVICE_KEY")
    return env_value if env_value else None


def save_device_key(key: str) -> None:
    """
    Persist the device key in the OS credential store.

    Raises CredentialStoreError if:
    - key is not a non-empty string
    - keyring is unavailable
    - the write fails
    - immediate read-back returns a mismatched value (verify-after-write)

    The key value is never logged.
    """
    if not isinstance(key, str) or not key.strip():
        raise CredentialStoreError("device_key must be a non-empty string.")

    if not _KEYRING_AVAILABLE:
        raise CredentialStoreError(
            "keyring library is not available — cannot persist device key."
        )

    try:
        keyring.set_password(SERVICE_NAME, DEVICE_KEY_NAME, key)
    except Exception as exc:
        raise CredentialStoreError(
            f"Failed to write device key to credential store: {exc}"
        ) from exc

    try:
        stored = keyring.get_password(SERVICE_NAME, DEVICE_KEY_NAME)
    except Exception as exc:
        raise CredentialStoreError(
            f"Failed to verify device key after write: {exc}"
        ) from exc

    if stored != key:
        raise CredentialStoreError(
            "Device key verification failed: stored value does not match."
        )


def clear_device_key() -> None:
    """
    Remove the device key from the OS credential store.

    Silently succeeds if the key is already absent (idempotent).
    Raises CredentialStoreError on unexpected failure.
    The key value is never logged.
    """
    if not _KEYRING_AVAILABLE:
        return

    try:
        keyring.delete_password(SERVICE_NAME, DEVICE_KEY_NAME)
    except keyring.errors.PasswordDeleteError:
        pass  # Already absent — idempotent
    except Exception as exc:
        raise CredentialStoreError(f"Failed to clear device key: {exc}") from exc


def is_registered() -> bool:
    """Return True if a device key is present in the credential store."""
    return load_device_key() is not None
