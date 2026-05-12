"""
Phase 5G — Startup Registration Trigger Tests

Runner (from atlas-agent/):
    python -m unittest tests.test_device_registration_startup -v
    python -m unittest discover tests -v

No real network, no real keyring, no UI, no real backend.
Flow is injected via flow_factory.
"""
from __future__ import annotations

import io
import os
import sys
import unittest
from unittest import mock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from device_client import AtlasDeviceClient
from device_registration_startup import (
    StartupRegistrationResult,
    maybe_start_registration_from_startup_check,
)
from device_startup import StartupDeviceCheck
from device_state import DeviceState, DeviceStateResult

# ── Helpers ───────────────────────────────────────────────────────────────────

BACKEND_URL = "http://localhost:3000"


def _make_check(should_start: bool, state: DeviceState | None = None) -> StartupDeviceCheck:
    """Build a StartupDeviceCheck with the given should_start_registration flag."""
    if state is None:
        state = DeviceState.UNREGISTERED if should_start else DeviceState.REGISTERED
    return StartupDeviceCheck(
        result=DeviceStateResult(state=state, device_key_present=not should_start),
        should_start_registration=should_start,
        should_allow_planner=not should_start,
        user_message="test",
    )


def _success_flow(device_code: str = "dc_test123", url: str = "https://example.com/r", **extra):
    """Return a mock flow whose start() reports success."""
    flow = mock.MagicMock()
    flow.start.return_value = {
        "ok": True,
        "device_code": device_code,
        "registration_url": url,
        "expires_at": "2024-06-01T12:00:00Z",
        "poll_interval_secs": 5,
        **extra,
    }
    return flow


def _error_flow(error_code: str = "REGISTRATION_UNAVAILABLE", message: str = "Cannot register."):
    """Return a mock flow whose start() reports failure."""
    flow = mock.MagicMock()
    flow.start.return_value = {"ok": False, "error_code": error_code, "message": message}
    return flow


def _run(startup_check, backend_url=BACKEND_URL, flow=None, **kwargs) -> StartupRegistrationResult:
    factory = (lambda _client: flow) if flow is not None else None
    return maybe_start_registration_from_startup_check(
        startup_check=startup_check,
        backend_url=backend_url,
        flow_factory=factory,
        **kwargs,
    )


# ── Tests ─────────────────────────────────────────────────────────────────────

class TestNotRequired(unittest.TestCase):
    """Case 1: should_start_registration False → attempted False, flow not called."""

    def test_not_attempted_when_registration_not_required(self) -> None:
        flow = _success_flow()
        result = _run(_make_check(should_start=False), flow=flow)
        self.assertFalse(result.attempted)
        self.assertFalse(result.started)
        flow.start.assert_not_called()


class TestMissingBackendUrl(unittest.TestCase):
    """Case 2: registration needed but backend_url empty → BACKEND_URL_MISSING."""

    def test_backend_url_missing_returns_error(self) -> None:
        result = _run(_make_check(should_start=True), backend_url="", flow=_success_flow())
        self.assertTrue(result.attempted)
        self.assertFalse(result.started)
        self.assertEqual(result.error_code, "BACKEND_URL_MISSING")


class TestSuccess(unittest.TestCase):
    """Case 3: flow start succeeds → attempted True, started True, fields populated."""

    def test_started_true_with_all_fields_on_success(self) -> None:
        flow = _success_flow(
            device_code="dc_abc123",
            url="https://example.com/register",
            expires_at="2024-06-01T12:00:00Z",
            poll_interval_secs=5,
        )
        result = _run(_make_check(should_start=True), flow=flow)
        self.assertTrue(result.attempted)
        self.assertTrue(result.started)
        self.assertEqual(result.device_code, "dc_abc123")
        self.assertEqual(result.registration_url, "https://example.com/register")
        self.assertEqual(result.expires_at, "2024-06-01T12:00:00Z")
        self.assertEqual(result.poll_interval_secs, 5)


class TestFlowError(unittest.TestCase):
    """Case 4: flow start fails → attempted True, started False, error propagated."""

    def test_flow_error_propagates_code_and_message(self) -> None:
        flow = _error_flow("REGISTRATION_UNAVAILABLE", "Backend is down.")
        result = _run(_make_check(should_start=True), flow=flow)
        self.assertTrue(result.attempted)
        self.assertFalse(result.started)
        self.assertEqual(result.error_code, "REGISTRATION_UNAVAILABLE")
        self.assertEqual(result.message, "Backend is down.")


class TestPlatformAndClientVersion(unittest.TestCase):
    """Case 5: platform and client_version are passed to flow.start()."""

    def test_platform_and_client_version_forwarded(self) -> None:
        flow = _success_flow()
        _run(
            _make_check(should_start=True),
            flow=flow,
            platform="windows",
            client_version="1.2.3",
        )
        flow.start.assert_called_once_with(platform="windows", client_version="1.2.3")


class TestFlowFactoryDI(unittest.TestCase):
    """Case 6: flow_factory is called with an AtlasDeviceClient and its result is used."""

    def test_factory_receives_atlas_device_client(self) -> None:
        factory_calls: list = []
        flow = _success_flow()

        def my_factory(client):
            factory_calls.append(client)
            return flow

        maybe_start_registration_from_startup_check(
            startup_check=_make_check(should_start=True),
            backend_url=BACKEND_URL,
            flow_factory=my_factory,
        )

        self.assertEqual(len(factory_calls), 1)
        self.assertIsInstance(factory_calls[0], AtlasDeviceClient)
        flow.start.assert_called_once()


class TestNoPollLoop(unittest.TestCase):
    """Case 7: run_poll_loop is never called."""

    def test_poll_loop_not_called(self) -> None:
        flow = _success_flow()
        _run(_make_check(should_start=True), flow=flow)
        flow.run_poll_loop.assert_not_called()


class TestNoSaveDeviceKey(unittest.TestCase):
    """Case 8: save_device_key is never called."""

    def test_save_device_key_not_called(self) -> None:
        with mock.patch("device_credentials.save_device_key") as mock_save:
            flow = _success_flow()
            _run(_make_check(should_start=True), flow=flow)
            mock_save.assert_not_called()


class TestNoSensitiveOutput(unittest.TestCase):
    """Case 9: device_code and registration_url must not appear in stdout or stderr."""

    DEVICE_CODE = "dc_SENSITIVE_MUST_NOT_APPEAR_IN_OUTPUT"
    REG_URL = "https://SENSITIVE_REG_URL_MUST_NOT_APPEAR"

    def test_no_device_code_or_url_in_stdout_stderr(self) -> None:
        flow = _success_flow(device_code=self.DEVICE_CODE, url=self.REG_URL)
        out, err = io.StringIO(), io.StringIO()
        with mock.patch("sys.stdout", out), mock.patch("sys.stderr", err):
            _run(_make_check(should_start=True), flow=flow)
        combined = out.getvalue() + err.getvalue()
        self.assertNotIn(self.DEVICE_CODE, combined)
        self.assertNotIn(self.REG_URL, combined)


class TestStateMapping(unittest.TestCase):
    """Case 10: correct should_start_registration for each DeviceState."""

    def _result_for_state(self, state: DeviceState) -> StartupRegistrationResult:
        from device_startup import run_startup_device_check
        # Determine expected flags from the state machine
        check = run_startup_device_check(
            validate_device_key_fn=self._validator_for(state),
            load_device_key_fn=self._loader_for(state),
            clear_device_key_fn=lambda: None,
        )
        return maybe_start_registration_from_startup_check(
            startup_check=check,
            backend_url=BACKEND_URL,
            flow_factory=lambda _: _success_flow(),
        )

    @staticmethod
    def _loader_for(state: DeviceState):
        return (lambda: None) if state == DeviceState.UNREGISTERED else (lambda: "atl_key")

    @staticmethod
    def _validator_for(state: DeviceState):
        mapping = {
            DeviceState.REGISTERED: {"ok": True},
            DeviceState.UNREGISTERED: {"ok": True},  # no key → UNREGISTERED regardless
            DeviceState.REVOKED: {"ok": False, "code": "DEVICE_REVOKED"},
            DeviceState.AUTH_FAILED: {"ok": False, "code": "INVALID_DEVICE_KEY"},
            DeviceState.OFFLINE: {"ok": False, "code": "NETWORK_ERROR"},
        }
        return lambda _: mapping[state]

    def test_unregistered_triggers_registration(self) -> None:
        r = self._result_for_state(DeviceState.UNREGISTERED)
        self.assertTrue(r.attempted)
        self.assertTrue(r.started)

    def test_revoked_triggers_registration(self) -> None:
        r = self._result_for_state(DeviceState.REVOKED)
        self.assertTrue(r.attempted)
        self.assertTrue(r.started)

    def test_auth_failed_triggers_registration(self) -> None:
        r = self._result_for_state(DeviceState.AUTH_FAILED)
        self.assertTrue(r.attempted)
        self.assertTrue(r.started)

    def test_offline_does_not_trigger_registration(self) -> None:
        r = self._result_for_state(DeviceState.OFFLINE)
        self.assertFalse(r.attempted)

    def test_registered_does_not_trigger_registration(self) -> None:
        r = self._result_for_state(DeviceState.REGISTERED)
        self.assertFalse(r.attempted)


if __name__ == "__main__":
    unittest.main()
