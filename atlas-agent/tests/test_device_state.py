"""
Phase 5D — Device State Machine Tests

Runner (from atlas-agent/):
    python -m unittest tests.test_device_state -v
    python -m unittest discover tests -v

No real keyring, no real network, no real backend.
All dependencies are injected via plain callables.
"""
from __future__ import annotations

import io
import os
import sys
import unittest
from unittest import mock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from device_state import DeviceState, DeviceStateResult, resolve_startup_device_state

# ── Test helpers ──────────────────────────────────────────────────────────────

FAKE_KEY = "atl_FAKE_DEVICE_KEY_DO_NOT_LOG"


def _no_key() -> None:
    return None


def _has_key() -> str:
    return FAKE_KEY


def _clear_noop() -> None:
    pass


def _validate_ok(_key: str) -> dict:
    return {"ok": True}


def _validate_code(code: str):
    def _fn(_key: str) -> dict:
        return {"ok": False, "code": code}
    return _fn


def _resolve(**overrides):
    """Call resolve_startup_device_state with sensible defaults, overriding as needed."""
    return resolve_startup_device_state(
        load_device_key_fn=overrides.get("load", _has_key),
        clear_device_key_fn=overrides.get("clear", _clear_noop),
        validate_device_key_fn=overrides.get("validate", _validate_ok),
    )


# ── Tests ─────────────────────────────────────────────────────────────────────

class TestNoLocalKey(unittest.TestCase):
    """Case 1: no stored key → UNREGISTERED."""

    def test_no_key_returns_unregistered_with_key_absent(self) -> None:
        result = _resolve(load=_no_key)
        self.assertEqual(result.state, DeviceState.UNREGISTERED)
        self.assertFalse(result.device_key_present)


class TestRegistered(unittest.TestCase):
    """Case 2: key present + validator ok → REGISTERED."""

    def test_key_plus_ok_validation_returns_registered(self) -> None:
        result = _resolve()  # defaults: _has_key + _validate_ok
        self.assertEqual(result.state, DeviceState.REGISTERED)
        self.assertTrue(result.device_key_present)


class TestRevoked(unittest.TestCase):
    """Case 3: DEVICE_REVOKED → clear called, REVOKED, key_present False."""

    def test_revoked_clears_key_and_returns_revoked(self) -> None:
        cleared: list[bool] = []
        result = _resolve(
            validate=_validate_code("DEVICE_REVOKED"),
            clear=lambda: cleared.append(True),
        )
        self.assertEqual(result.state, DeviceState.REVOKED)
        self.assertFalse(result.device_key_present)
        self.assertEqual(len(cleared), 1)


class TestInvalidKey(unittest.TestCase):
    """Case 4: INVALID_DEVICE_KEY → AUTH_FAILED, clear NOT called."""

    def test_invalid_key_returns_auth_failed_without_clearing(self) -> None:
        cleared: list[bool] = []
        result = _resolve(
            validate=_validate_code("INVALID_DEVICE_KEY"),
            clear=lambda: cleared.append(True),
        )
        self.assertEqual(result.state, DeviceState.AUTH_FAILED)
        self.assertTrue(result.device_key_present)
        self.assertEqual(len(cleared), 0)


class TestNetworkError(unittest.TestCase):
    """Cases 5 & 6: transient/unavailable codes → OFFLINE, clear NOT called."""

    def test_network_error_returns_offline_without_clearing(self) -> None:
        cleared: list[bool] = []
        result = _resolve(
            validate=_validate_code("NETWORK_ERROR"),
            clear=lambda: cleared.append(True),
        )
        self.assertEqual(result.state, DeviceState.OFFLINE)
        self.assertTrue(result.device_key_present)
        self.assertEqual(len(cleared), 0)

    def test_device_auth_unavailable_returns_offline(self) -> None:
        result = _resolve(validate=_validate_code("DEVICE_AUTH_UNAVAILABLE"))
        self.assertEqual(result.state, DeviceState.OFFLINE)
        self.assertTrue(result.device_key_present)


class TestLoadKeyRaises(unittest.TestCase):
    """Case 7: load_device_key_fn raises → AUTH_FAILED + CREDENTIAL_STORE_ERROR."""

    def test_load_raises_returns_auth_failed_with_credential_store_error(self) -> None:
        def _raise() -> str:
            raise RuntimeError("keyring backend unavailable")

        result = _resolve(load=_raise)
        self.assertEqual(result.state, DeviceState.AUTH_FAILED)
        self.assertFalse(result.device_key_present)
        self.assertEqual(result.error_code, "CREDENTIAL_STORE_ERROR")


class TestClearRaisesOnRevoked(unittest.TestCase):
    """Case 8: clear raises during DEVICE_REVOKED → REVOKED + CLEAR_DEVICE_KEY_FAILED."""

    def test_clear_raises_returns_revoked_with_clear_failed_error_code(self) -> None:
        def _raise_clear() -> None:
            raise OSError("access denied")

        result = _resolve(
            validate=_validate_code("DEVICE_REVOKED"),
            clear=_raise_clear,
        )
        self.assertEqual(result.state, DeviceState.REVOKED)
        self.assertEqual(result.error_code, "CLEAR_DEVICE_KEY_FAILED")


class TestNoKeyLogging(unittest.TestCase):
    """Case 9: raw device_key must not appear in stdout or stderr on any path."""

    SENSITIVE_KEY = "atl_SENSITIVE_MUST_NOT_APPEAR_IN_OUTPUT"

    def _capture(self, fn) -> str:
        out, err = io.StringIO(), io.StringIO()
        with mock.patch("sys.stdout", out), mock.patch("sys.stderr", err):
            try:
                fn()
            except Exception:
                pass
        return out.getvalue() + err.getvalue()

    def test_key_not_printed_on_registered_path(self) -> None:
        output = self._capture(lambda: resolve_startup_device_state(
            load_device_key_fn=lambda: self.SENSITIVE_KEY,
            clear_device_key_fn=_clear_noop,
            validate_device_key_fn=_validate_ok,
        ))
        self.assertNotIn(self.SENSITIVE_KEY, output)

    def test_key_not_printed_on_revoked_path(self) -> None:
        output = self._capture(lambda: resolve_startup_device_state(
            load_device_key_fn=lambda: self.SENSITIVE_KEY,
            clear_device_key_fn=_clear_noop,
            validate_device_key_fn=_validate_code("DEVICE_REVOKED"),
        ))
        self.assertNotIn(self.SENSITIVE_KEY, output)


class TestUnknownCode(unittest.TestCase):
    """Case 10: unrecognised validation code → AUTH_FAILED."""

    def test_unknown_code_returns_auth_failed(self) -> None:
        result = _resolve(validate=_validate_code("SOME_UNEXPECTED_CODE"))
        self.assertEqual(result.state, DeviceState.AUTH_FAILED)
        self.assertTrue(result.device_key_present)


class TestValidatorRaises(unittest.TestCase):
    """Cases 11 & 12: validator raises → OFFLINE."""

    def test_timeout_exception_returns_offline(self) -> None:
        def _timeout(_key: str) -> dict:
            raise TimeoutError("connection timed out")

        result = _resolve(validate=_timeout)
        self.assertEqual(result.state, DeviceState.OFFLINE)
        self.assertTrue(result.device_key_present)

    def test_generic_exception_returns_offline(self) -> None:
        def _explode(_key: str) -> dict:
            raise Exception("something went wrong")

        result = _resolve(validate=_explode)
        self.assertEqual(result.state, DeviceState.OFFLINE)
        self.assertTrue(result.device_key_present)


if __name__ == "__main__":
    unittest.main()
