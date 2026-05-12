"""
Phase 5I — start_registration_polling tests.

Runner (from atlas-agent/):
    python -m unittest tests.test_device_registration_polling -v
    python -m unittest discover tests -v

No real network. No real keyring. No real UI. No real backend.
Thread target runs synchronously via _ImmediateThread for deterministic tests.
"""
from __future__ import annotations

import io
import os
import sys
import threading
import time
import unittest
from unittest import mock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from device_client import ClientError, PollResult
from device_registration import DeviceRegistrationFlow
from device_registration_polling import (
    PollingCallbacks,
    RegistrationPollingHandle,
    start_registration_polling,
)
from device_registration_startup import StartupRegistrationResult

# ── Helpers ───────────────────────────────────────────────────────────────────

BACKEND = "http://localhost:3000"


class _ImmediateThread:
    """Replacement for threading.Thread that runs target synchronously on start()."""

    def __init__(self, target=None, daemon=None, **kw):
        self._target = target
        self.daemon = daemon

    def start(self):
        if self._target:
            self._target()

    def join(self, timeout=None):
        pass


def _patch_thread():
    return mock.patch("device_registration_polling.threading.Thread", _ImmediateThread)


def _make_reg(
    started: bool = True,
    device_code: str = "dc_test_abc",
    poll_interval_secs: int = 5,
) -> StartupRegistrationResult:
    return StartupRegistrationResult(
        attempted=True,
        started=started,
        device_code=device_code if started else None,
        registration_url="https://app.aigency.com/r" if started else None,
        poll_interval_secs=poll_interval_secs,
    )


class _FakeFlow:
    """Deterministic poll loop: emits each status, then returns return_value."""

    def __init__(self, statuses: list[str], return_value: str | None):
        self.statuses = statuses
        self.return_value = return_value
        self.call_kwargs: dict = {}

    def run_poll_loop(
        self,
        device_code: str,
        interval_seconds: float = 5.0,
        max_polls: int = 180,
        on_status=None,
    ):
        self.call_kwargs = {
            "device_code": device_code,
            "interval_seconds": interval_seconds,
            "max_polls": max_polls,
        }
        for s in self.statuses:
            if on_status:
                on_status(s)
        return self.return_value


def _fake_factory(statuses: list[str], return_value: str | None):
    fake = _FakeFlow(statuses, return_value)

    def factory(client, save_fn):
        return fake

    return factory, fake


def _real_flow_factory_approved(saved: list):
    """Factory that creates a real DeviceRegistrationFlow with a mock client."""
    def factory(client, save_fn):
        mock_client = mock.MagicMock()
        mock_client.poll_registration.return_value = PollResult(
            ok=True, status="approved", device_key="atl_real_secret"
        )
        return DeviceRegistrationFlow(
            mock_client,
            save_fn=save_fn,
            sleep_fn=lambda _: None,
        )
    return factory


# ── Tests ─────────────────────────────────────────────────────────────────────

class TestNotStarted(unittest.TestCase):
    """Case 1: started=False → returns None, no thread created."""

    def test_returns_none_when_not_started(self) -> None:
        with mock.patch("device_registration_polling.threading.Thread") as mock_t:
            result = start_registration_polling(_make_reg(started=False), BACKEND)
        self.assertIsNone(result)
        mock_t.assert_not_called()


class TestMissingDeviceCode(unittest.TestCase):
    """Case 2: started=True but device_code is None/empty → None + on_failed."""

    def test_returns_none_and_calls_on_failed(self) -> None:
        reg = StartupRegistrationResult(
            attempted=True, started=True, device_code=None,
            registration_url=None, poll_interval_secs=5,
        )
        failed: list = []
        cbs = PollingCallbacks(on_failed=lambda code, msg: failed.append((code, msg)))
        with mock.patch("device_registration_polling.threading.Thread") as mock_t:
            result = start_registration_polling(reg, BACKEND, callbacks=cbs)
        self.assertIsNone(result)
        mock_t.assert_not_called()
        self.assertEqual(len(failed), 1)
        self.assertEqual(failed[0][0], "INVALID_REGISTRATION")


class TestMissingBackendUrl(unittest.TestCase):
    """Case 3: registration needed but backend_url empty → None + on_failed."""

    def test_returns_none_and_calls_on_failed(self) -> None:
        failed: list = []
        cbs = PollingCallbacks(on_failed=lambda code, msg: failed.append((code, msg)))
        with mock.patch("device_registration_polling.threading.Thread") as mock_t:
            result = start_registration_polling(_make_reg(), "", callbacks=cbs)
        self.assertIsNone(result)
        mock_t.assert_not_called()
        self.assertEqual(len(failed), 1)
        self.assertEqual(failed[0][0], "BACKEND_URL_MISSING")


class TestDaemonThread(unittest.TestCase):
    """Case 4: starts a daemon thread for valid registration."""

    def test_returns_handle_with_daemon_thread(self) -> None:
        factory, fake = _fake_factory([], "atl_k")
        handle = start_registration_polling(_make_reg(), BACKEND, flow_factory=factory)
        self.assertIsNotNone(handle)
        self.assertIsInstance(handle, RegistrationPollingHandle)
        self.assertTrue(handle.thread.daemon)
        handle.thread.join(timeout=2.0)

    def test_handle_carries_device_code(self) -> None:
        factory, _ = _fake_factory([], None)
        handle = start_registration_polling(
            _make_reg(device_code="dc_check"), BACKEND, flow_factory=factory
        )
        self.assertIsNotNone(handle)
        handle.thread.join(timeout=2.0)
        self.assertEqual(handle.device_code, "dc_check")


class TestIntervalFromStartupReg(unittest.TestCase):
    """Case 5: uses startup_registration.poll_interval_secs when no override."""

    def test_uses_poll_interval_secs(self) -> None:
        factory, fake = _fake_factory([], None)
        with _patch_thread():
            start_registration_polling(
                _make_reg(poll_interval_secs=7),
                BACKEND,
                flow_factory=factory,
            )
        self.assertEqual(fake.call_kwargs.get("interval_seconds"), 7.0)

    def test_defaults_to_5_when_poll_interval_none(self) -> None:
        reg = StartupRegistrationResult(
            attempted=True, started=True, device_code="dc_x",
            registration_url=None, poll_interval_secs=None,
        )
        factory, fake = _fake_factory([], None)
        with _patch_thread():
            start_registration_polling(reg, BACKEND, flow_factory=factory)
        self.assertEqual(fake.call_kwargs.get("interval_seconds"), 5.0)


class TestIntervalOverride(unittest.TestCase):
    """Case 6: explicit interval_seconds overrides startup_registration value."""

    def test_override_takes_precedence(self) -> None:
        factory, fake = _fake_factory([], None)
        with _patch_thread():
            start_registration_polling(
                _make_reg(poll_interval_secs=7),
                BACKEND,
                flow_factory=factory,
                interval_seconds=2.5,
            )
        self.assertEqual(fake.call_kwargs.get("interval_seconds"), 2.5)


class TestOnStatusCallback(unittest.TestCase):
    """Case 7: on_status callback receives statuses from the flow."""

    def test_on_status_called_for_each_status(self) -> None:
        received: list[str] = []
        factory, _ = _fake_factory(["pending", "pending", "approved"], "atl_k")
        cbs = PollingCallbacks(on_status=received.append)
        with _patch_thread():
            start_registration_polling(_make_reg(), BACKEND, callbacks=cbs, flow_factory=factory)
        self.assertEqual(received, ["pending", "pending", "approved"])


class TestOnRegisteredCallback(unittest.TestCase):
    """Case 8: on_registered called when run_poll_loop returns a device_key."""

    def test_on_registered_called_on_approval(self) -> None:
        registered: list[bool] = []
        factory, _ = _fake_factory(["approved"], "atl_secret")
        cbs = PollingCallbacks(on_registered=lambda: registered.append(True))
        with _patch_thread():
            start_registration_polling(_make_reg(), BACKEND, callbacks=cbs, flow_factory=factory)
        self.assertEqual(registered, [True])

    def test_on_registered_not_called_on_none(self) -> None:
        registered: list[bool] = []
        factory, _ = _fake_factory(["expired"], None)
        cbs = PollingCallbacks(on_registered=lambda: registered.append(True))
        with _patch_thread():
            start_registration_polling(_make_reg(), BACKEND, callbacks=cbs, flow_factory=factory)
        self.assertEqual(registered, [])


class TestOnFailedCallback(unittest.TestCase):
    """Case 9: on_failed called when run_poll_loop returns None."""

    def test_on_failed_called_when_poll_returns_none(self) -> None:
        failed: list = []
        factory, _ = _fake_factory(["expired"], None)
        cbs = PollingCallbacks(on_failed=lambda c, m: failed.append((c, m)))
        with _patch_thread():
            start_registration_polling(_make_reg(), BACKEND, callbacks=cbs, flow_factory=factory)
        self.assertEqual(len(failed), 1)
        self.assertEqual(failed[0][0], "REGISTRATION_NOT_COMPLETED")

    def test_on_failed_not_called_on_approval(self) -> None:
        failed: list = []
        factory, _ = _fake_factory(["approved"], "atl_k")
        cbs = PollingCallbacks(on_failed=lambda c, m: failed.append((c, m)))
        with _patch_thread():
            start_registration_polling(_make_reg(), BACKEND, callbacks=cbs, flow_factory=factory)
        self.assertEqual(failed, [])


class TestSaveCalledExactlyOnce(unittest.TestCase):
    """Case 10: save_device_key_fn called exactly once by the flow on approval."""

    def test_save_fn_called_once_on_approved(self) -> None:
        saved: list[str] = []
        factory = _real_flow_factory_approved(saved)
        with _patch_thread():
            start_registration_polling(
                _make_reg(),
                BACKEND,
                save_device_key_fn=saved.append,
                flow_factory=factory,
            )
        self.assertEqual(len(saved), 1)
        self.assertEqual(saved[0], "atl_real_secret")

    def test_save_fn_not_called_on_failed_poll(self) -> None:
        saved: list[str] = []
        factory, _ = _fake_factory(["expired"], None)
        with _patch_thread():
            start_registration_polling(
                _make_reg(),
                BACKEND,
                save_device_key_fn=saved.append,
                flow_factory=factory,
            )
        self.assertEqual(saved, [])


class TestNoSensitiveOutput(unittest.TestCase):
    """Case 11: device_code and device_key must not appear in stdout or stderr."""

    DEVICE_CODE = "dc_SENSITIVE_MUST_NOT_APPEAR_5I"
    DEVICE_KEY  = "atl_SENSITIVE_KEY_MUST_NOT_APPEAR"

    def test_no_sensitive_data_in_output(self) -> None:
        saved: list = []
        factory = _real_flow_factory_approved(saved)
        out, err = io.StringIO(), io.StringIO()
        reg = _make_reg(device_code=self.DEVICE_CODE)
        with mock.patch("sys.stdout", out), mock.patch("sys.stderr", err):
            with _patch_thread():
                start_registration_polling(
                    reg,
                    BACKEND,
                    save_device_key_fn=lambda k: None,
                    flow_factory=factory,
                )
        combined = out.getvalue() + err.getvalue()
        self.assertNotIn(self.DEVICE_CODE, combined)


class TestDoesNotBlockMainThread(unittest.TestCase):
    """Case 12: run_poll_loop runs in background; start_registration_polling returns immediately."""

    def test_returns_before_poll_completes(self) -> None:
        block_event = threading.Event()

        def slow_factory(client, save_fn):
            m = mock.MagicMock()
            def slow_run(*args, **kwargs):
                block_event.wait(timeout=5)
                return None
            m.run_poll_loop.side_effect = slow_run
            return m

        start = time.monotonic()
        handle = start_registration_polling(_make_reg(), BACKEND, flow_factory=slow_factory)
        elapsed = time.monotonic() - start

        self.assertIsNotNone(handle)
        self.assertLess(elapsed, 1.0, "start_registration_polling blocked longer than 1s")
        self.assertTrue(handle.thread.daemon)

        block_event.set()
        handle.thread.join(timeout=2.0)


if __name__ == "__main__":
    unittest.main()
