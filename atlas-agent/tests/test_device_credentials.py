"""
Phase 5B — Device Credential Store Tests

Runner (from atlas-agent/):
    python -m unittest tests.test_device_credentials -v
    python -m unittest discover tests -v

No real keyring backend is used — all calls go through MockKeyringBackend.
No real environment variables are read without explicit setup.
"""

from __future__ import annotations

import io
import os
import sys
import unittest
from contextlib import contextmanager
from typing import Iterator
from unittest import mock

# Ensure atlas-agent root is on the path regardless of invocation style.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import keyring
import keyring.errors

import device_credentials
from device_credentials import (
    DEVICE_KEY_NAME,
    SERVICE_NAME,
    CredentialStoreError,
    clear_device_key,
    is_registered,
    load_device_key,
    save_device_key,
)

# ── In-memory keyring backend ─────────────────────────────────────────────────

class MockKeyringBackend:
    """Minimal in-memory keyring for testing — no OS calls."""

    def __init__(self) -> None:
        self._store: dict[tuple[str, str], str] = {}

    def get_password(self, service: str, username: str) -> str | None:
        return self._store.get((service, username))

    def set_password(self, service: str, username: str, password: str) -> None:
        self._store[(service, username)] = password

    def delete_password(self, service: str, username: str) -> None:
        key = (service, username)
        if key not in self._store:
            raise keyring.errors.PasswordDeleteError(f"{username} not found")
        del self._store[key]


@contextmanager
def _patched_keyring(backend: MockKeyringBackend) -> Iterator[None]:
    """Context manager: routes all keyring calls to the given MockKeyringBackend."""
    with (
        mock.patch.object(keyring, "get_password", backend.get_password),
        mock.patch.object(keyring, "set_password", backend.set_password),
        mock.patch.object(keyring, "delete_password", backend.delete_password),
    ):
        yield


def _env_without_dev_key() -> dict[str, str]:
    """Current environment, stripped of ATLAS_DEV_DEVICE_KEY."""
    return {k: v for k, v in os.environ.items() if k != "ATLAS_DEV_DEVICE_KEY"}


# ── Tests ─────────────────────────────────────────────────────────────────────

class TestSaveAndLoad(unittest.TestCase):
    """Case 1: save → load returns the same value."""

    def test_save_then_load_returns_same_value(self) -> None:
        backend = MockKeyringBackend()
        with _patched_keyring(backend):
            save_device_key("atl_abc123def456")
            result = load_device_key()
        self.assertEqual(result, "atl_abc123def456")


class TestLoadReturnsNone(unittest.TestCase):
    """Case 2: keyring empty + no env var → None."""

    def test_load_when_keyring_empty_and_no_env_returns_none(self) -> None:
        backend = MockKeyringBackend()
        with _patched_keyring(backend), \
             mock.patch.dict(os.environ, _env_without_dev_key(), clear=True):
            result = load_device_key()
        self.assertIsNone(result)


class TestClearThenLoad(unittest.TestCase):
    """Case 3: clear → load returns None."""

    def test_clear_removes_key_from_store(self) -> None:
        backend = MockKeyringBackend()
        with _patched_keyring(backend):
            save_device_key("atl_to_be_cleared")
            clear_device_key()
            result = load_device_key()
        self.assertIsNone(result)


class TestKeyringFallback(unittest.TestCase):
    """Cases 4 & 5: keyring raises → env var fallback."""

    def test_keyring_raises_falls_back_to_env_var(self) -> None:
        """Case 4: get_password raises → return ATLAS_DEV_DEVICE_KEY."""
        with mock.patch.object(keyring, "get_password", side_effect=Exception("backend gone")), \
             mock.patch.dict(os.environ, {"ATLAS_DEV_DEVICE_KEY": "dev-fallback-key"}):
            result = load_device_key()
        self.assertEqual(result, "dev-fallback-key")

    def test_keyring_raises_and_no_env_var_returns_none(self) -> None:
        """Case 5: get_password raises + no env var → None."""
        with mock.patch.object(keyring, "get_password", side_effect=Exception("backend gone")), \
             mock.patch.dict(os.environ, _env_without_dev_key(), clear=True):
            result = load_device_key()
        self.assertIsNone(result)


class TestSaveVerification(unittest.TestCase):
    """Case 6: verify-after-write detects mismatch → CredentialStoreError."""

    def test_save_mismatch_raises_credential_store_error(self) -> None:
        get_call = [0]

        def flaky_get(service: str, username: str) -> str:
            get_call[0] += 1
            # First read-back (verify step) returns a different value.
            return "WRONG_VALUE" if get_call[0] == 1 else "atl_original"

        with mock.patch.object(keyring, "set_password"), \
             mock.patch.object(keyring, "get_password", side_effect=flaky_get):
            with self.assertRaises(CredentialStoreError):
                save_device_key("atl_original")


class TestClearIdempotency(unittest.TestCase):
    """Case 7: clear when already absent → no exception."""

    def test_clear_when_absent_does_not_raise(self) -> None:
        backend = MockKeyringBackend()  # empty store
        with _patched_keyring(backend):
            clear_device_key()  # must not raise

    def test_double_clear_does_not_raise(self) -> None:
        backend = MockKeyringBackend()
        with _patched_keyring(backend):
            save_device_key("atl_double_clear_test")
            clear_device_key()
            clear_device_key()  # second clear: already absent


class TestIsRegistered(unittest.TestCase):
    """Cases 8 & 9: is_registered reflects presence of key."""

    def test_is_registered_false_when_no_key(self) -> None:
        """Case 8."""
        backend = MockKeyringBackend()
        with _patched_keyring(backend), \
             mock.patch.dict(os.environ, _env_without_dev_key(), clear=True):
            self.assertFalse(is_registered())

    def test_is_registered_true_when_key_present(self) -> None:
        """Case 9."""
        backend = MockKeyringBackend()
        with _patched_keyring(backend):
            save_device_key("atl_registered")
            self.assertTrue(is_registered())


class TestSaveValidation(unittest.TestCase):
    """Case 10: invalid key argument → CredentialStoreError before any I/O."""

    def test_save_empty_string_raises(self) -> None:
        with self.assertRaises(CredentialStoreError):
            save_device_key("")

    def test_save_whitespace_only_raises(self) -> None:
        with self.assertRaises(CredentialStoreError):
            save_device_key("   ")

    def test_save_none_raises(self) -> None:
        with self.assertRaises(CredentialStoreError):
            save_device_key(None)  # type: ignore[arg-type]

    def test_save_integer_raises(self) -> None:
        with self.assertRaises(CredentialStoreError):
            save_device_key(12345)  # type: ignore[arg-type]

    def test_save_list_raises(self) -> None:
        with self.assertRaises(CredentialStoreError):
            save_device_key(["atl_key"])  # type: ignore[arg-type]


class TestNoKeyLogging(unittest.TestCase):
    """
    Case 11: no function prints or writes the raw device_key to stdout/stderr.
    Uses io.StringIO captures — does not mock the logging module because
    device_credentials.py has no logging calls.
    """

    SENSITIVE_KEY = "atl_SENSITIVE_MUST_NOT_APPEAR_IN_OUTPUT"

    def _capture(self, fn) -> str:
        """Run fn() and return everything written to stdout + stderr."""
        out, err = io.StringIO(), io.StringIO()
        with mock.patch("sys.stdout", out), mock.patch("sys.stderr", err):
            try:
                fn()
            except Exception:
                pass
        return out.getvalue() + err.getvalue()

    def test_load_does_not_log_key(self) -> None:
        backend = MockKeyringBackend()
        with _patched_keyring(backend):
            save_device_key(self.SENSITIVE_KEY)
            output = self._capture(load_device_key)
        self.assertNotIn(self.SENSITIVE_KEY, output)

    def test_save_does_not_log_key(self) -> None:
        backend = MockKeyringBackend()
        with _patched_keyring(backend):
            output = self._capture(lambda: save_device_key(self.SENSITIVE_KEY))
        self.assertNotIn(self.SENSITIVE_KEY, output)

    def test_clear_does_not_log_key(self) -> None:
        backend = MockKeyringBackend()
        with _patched_keyring(backend):
            save_device_key(self.SENSITIVE_KEY)
            output = self._capture(clear_device_key)
        self.assertNotIn(self.SENSITIVE_KEY, output)

    def test_is_registered_does_not_log_key(self) -> None:
        backend = MockKeyringBackend()
        with _patched_keyring(backend):
            save_device_key(self.SENSITIVE_KEY)
            output = self._capture(is_registered)
        self.assertNotIn(self.SENSITIVE_KEY, output)


if __name__ == "__main__":
    unittest.main()
