"""
Phase 5E — StartupDeviceCheck Tests

Runner (from atlas-agent/):
    python -m unittest tests.test_device_startup -v
    python -m unittest discover tests -v

No real keyring, no real backend, no UI imports.
All dependencies are injected via plain callables.
"""
from __future__ import annotations

import io
import os
import sys
import unittest
from unittest import mock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from device_startup import (
    StartupDeviceCheck,
    dev_only_accept_existing_key_validator,
    run_startup_device_check,
)
from device_state import DeviceState

# ── Helpers ───────────────────────────────────────────────────────────────────

FAKE_KEY = "atl_FAKE_KEY_DO_NOT_LOG"


def _check(load_fn, validate_fn, clear_fn=None) -> StartupDeviceCheck:
    return run_startup_device_check(
        validate_device_key_fn=validate_fn,
        load_device_key_fn=load_fn,
        clear_device_key_fn=clear_fn or (lambda: None),
    )


def _validate(code: str):
    return lambda _key: {"ok": False, "code": code}


# ── Tests ─────────────────────────────────────────────────────────────────────

class TestRegistered(unittest.TestCase):
    """Case 1: registered → allow planner, no registration needed."""

    def test_registered_allows_planner_and_blocks_registration(self) -> None:
        check = _check(
            load_fn=lambda: FAKE_KEY,
            validate_fn=lambda _: {"ok": True},
        )
        self.assertEqual(check.result.state, DeviceState.REGISTERED)
        self.assertTrue(check.should_allow_planner)
        self.assertFalse(check.should_start_registration)


class TestUnregistered(unittest.TestCase):
    """Case 2: unregistered → require registration, block planner."""

    def test_unregistered_requires_registration_and_blocks_planner(self) -> None:
        check = _check(
            load_fn=lambda: None,
            validate_fn=lambda _: {"ok": True},
        )
        self.assertEqual(check.result.state, DeviceState.UNREGISTERED)
        self.assertTrue(check.should_start_registration)
        self.assertFalse(check.should_allow_planner)


class TestRevoked(unittest.TestCase):
    """Case 3: revoked → require registration, block planner."""

    def test_revoked_requires_registration_and_blocks_planner(self) -> None:
        check = _check(
            load_fn=lambda: FAKE_KEY,
            validate_fn=_validate("DEVICE_REVOKED"),
        )
        self.assertEqual(check.result.state, DeviceState.REVOKED)
        self.assertTrue(check.should_start_registration)
        self.assertFalse(check.should_allow_planner)


class TestAuthFailed(unittest.TestCase):
    """Case 4: auth_failed → require registration, block planner."""

    def test_auth_failed_requires_registration_and_blocks_planner(self) -> None:
        check = _check(
            load_fn=lambda: FAKE_KEY,
            validate_fn=_validate("INVALID_DEVICE_KEY"),
        )
        self.assertEqual(check.result.state, DeviceState.AUTH_FAILED)
        self.assertTrue(check.should_start_registration)
        self.assertFalse(check.should_allow_planner)


class TestOffline(unittest.TestCase):
    """Case 5: offline → block both planner and registration."""

    def test_offline_blocks_planner_and_registration(self) -> None:
        check = _check(
            load_fn=lambda: FAKE_KEY,
            validate_fn=_validate("NETWORK_ERROR"),
        )
        self.assertEqual(check.result.state, DeviceState.OFFLINE)
        self.assertFalse(check.should_allow_planner)
        self.assertFalse(check.should_start_registration)


class TestNoKeyInMessage(unittest.TestCase):
    """Case 6: user_message must not contain the raw device_key."""

    SENSITIVE_KEY = "atl_SENSITIVE_MUST_NOT_APPEAR_IN_MESSAGE"

    def _run(self, validate_fn) -> StartupDeviceCheck:
        return _check(
            load_fn=lambda: self.SENSITIVE_KEY,
            validate_fn=validate_fn,
        )

    def test_registered_message_has_no_key(self) -> None:
        check = self._run(lambda _: {"ok": True})
        self.assertNotIn(self.SENSITIVE_KEY, check.user_message)

    def test_auth_failed_message_has_no_key(self) -> None:
        check = self._run(_validate("INVALID_DEVICE_KEY"))
        self.assertNotIn(self.SENSITIVE_KEY, check.user_message)

    def test_offline_message_has_no_key(self) -> None:
        check = self._run(_validate("NETWORK_ERROR"))
        self.assertNotIn(self.SENSITIVE_KEY, check.user_message)


class TestInjectedFunctionsAreCalled(unittest.TestCase):
    """Case 7: run_startup_device_check passes through all injected callables."""

    def test_load_and_validate_are_invoked(self) -> None:
        load_calls: list = []
        validate_calls: list = []

        def _load():
            load_calls.append(True)
            return "atl_injected_key"

        def _validate(key):
            validate_calls.append(key)
            return {"ok": True}

        run_startup_device_check(
            validate_device_key_fn=_validate,
            load_device_key_fn=_load,
            clear_device_key_fn=lambda: None,
        )

        self.assertEqual(len(load_calls), 1)
        self.assertEqual(len(validate_calls), 1)

    def test_clear_called_on_revoked(self) -> None:
        clear_calls: list = []

        run_startup_device_check(
            validate_device_key_fn=_validate("DEVICE_REVOKED"),
            load_device_key_fn=lambda: "atl_injected_key",
            clear_device_key_fn=lambda: clear_calls.append(True),
        )

        self.assertEqual(len(clear_calls), 1)


class TestDevOnlyValidator(unittest.TestCase):
    """Case 8: dev_only validator returns ok and never logs the key."""

    SENSITIVE = "atl_SENSITIVE_MUST_NOT_APPEAR_IN_OUTPUT"

    def test_returns_ok_true(self) -> None:
        result = dev_only_accept_existing_key_validator("atl_any_key")
        self.assertTrue(result.get("ok"))

    def test_does_not_log_key(self) -> None:
        out, err = io.StringIO(), io.StringIO()
        with mock.patch("sys.stdout", out), mock.patch("sys.stderr", err):
            dev_only_accept_existing_key_validator(self.SENSITIVE)
        self.assertNotIn(self.SENSITIVE, out.getvalue() + err.getvalue())


if __name__ == "__main__":
    unittest.main()
