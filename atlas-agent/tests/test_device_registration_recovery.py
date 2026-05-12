"""
Phase 5K — retry_registration tests.

Runner (from atlas-agent/):
    python -m unittest tests.test_device_registration_recovery -v
    python -m unittest discover tests -v

No real network. No real keyring. No real UI.
start_fn and polling_fn are injected mocks.
"""
from __future__ import annotations

import io
import os
import sys
import unittest
from unittest import mock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

sys.modules.setdefault("keyring", mock.MagicMock())
sys.modules.setdefault("keyring.errors", mock.MagicMock())

from device_registration_polling import PollingCallbacks
from device_registration_recovery import RegistrationRetryResult, retry_registration
from device_registration_startup import StartupRegistrationResult

# ── Fixtures ──────────────────────────────────────────────────────────────────

BACKEND = "http://localhost:3000"


def _make_started_reg(device_code: str = "dc_retry_test") -> StartupRegistrationResult:
    return StartupRegistrationResult(
        attempted=True,
        started=True,
        device_code=device_code,
        registration_url="https://app.aigency.com/register?code=" + device_code,
        expires_at="2026-01-01T00:00:00Z",
        poll_interval_secs=5,
    )


def _make_failed_reg(
    code: str = "START_ERROR",
    message: str = "Backend unreachable.",
) -> StartupRegistrationResult:
    return StartupRegistrationResult(
        attempted=True,
        started=False,
        error_code=code,
        message=message,
    )


def _fake_startup_check():
    sc = mock.MagicMock()
    sc.should_start_registration = True
    return sc


# ── Tests ─────────────────────────────────────────────────────────────────────


class TestStartSuccess(unittest.TestCase):
    """Case 1: start success → polling_fn called with correct args."""

    def test_polling_fn_called(self) -> None:
        reg = _make_started_reg()
        start_fn = mock.MagicMock(return_value=reg)
        poll_fn = mock.MagicMock()

        retry_registration(
            startup_check=_fake_startup_check(),
            backend_url=BACKEND,
            callbacks=PollingCallbacks(),
            start_fn=start_fn,
            polling_fn=poll_fn,
        )

        poll_fn.assert_called_once()

    def test_polling_fn_receives_startup_registration(self) -> None:
        reg = _make_started_reg()
        poll_fn = mock.MagicMock()

        retry_registration(
            startup_check=_fake_startup_check(),
            backend_url=BACKEND,
            callbacks=PollingCallbacks(),
            start_fn=mock.MagicMock(return_value=reg),
            polling_fn=poll_fn,
        )

        _, kw = poll_fn.call_args
        self.assertIs(kw["startup_registration"], reg)
        self.assertEqual(kw["backend_url"], BACKEND)

    def test_result_started_true(self) -> None:
        result = retry_registration(
            startup_check=_fake_startup_check(),
            backend_url=BACKEND,
            callbacks=PollingCallbacks(),
            start_fn=mock.MagicMock(return_value=_make_started_reg()),
            polling_fn=mock.MagicMock(),
        )
        self.assertTrue(result.started)
        self.assertTrue(result.attempted)


class TestStartFailure(unittest.TestCase):
    """Cases 2 + 4: start fails → on_failed called, polling_fn NOT called."""

    def test_on_failed_called_with_code_and_message(self) -> None:
        failed: list = []
        cbs = PollingCallbacks(on_failed=lambda c, m: failed.append((c, m)))
        poll_fn = mock.MagicMock()

        retry_registration(
            startup_check=_fake_startup_check(),
            backend_url=BACKEND,
            callbacks=cbs,
            start_fn=mock.MagicMock(return_value=_make_failed_reg("MY_ERR", "Oops.")),
            polling_fn=poll_fn,
        )

        self.assertEqual(len(failed), 1)
        self.assertEqual(failed[0][0], "MY_ERR")
        self.assertEqual(failed[0][1], "Oops.")

    def test_polling_fn_not_called_on_start_failure(self) -> None:
        poll_fn = mock.MagicMock()

        retry_registration(
            startup_check=_fake_startup_check(),
            backend_url=BACKEND,
            callbacks=PollingCallbacks(),
            start_fn=mock.MagicMock(return_value=_make_failed_reg()),
            polling_fn=poll_fn,
        )

        poll_fn.assert_not_called()

    def test_result_started_false(self) -> None:
        result = retry_registration(
            startup_check=_fake_startup_check(),
            backend_url=BACKEND,
            callbacks=PollingCallbacks(),
            start_fn=mock.MagicMock(return_value=_make_failed_reg("X", "y")),
            polling_fn=mock.MagicMock(),
        )
        self.assertFalse(result.started)
        self.assertTrue(result.attempted)
        self.assertEqual(result.error_code, "X")

    def test_fallback_error_code_when_none(self) -> None:
        reg = StartupRegistrationResult(
            attempted=True, started=False, error_code=None, message=""
        )
        result = retry_registration(
            startup_check=_fake_startup_check(),
            backend_url=BACKEND,
            callbacks=PollingCallbacks(),
            start_fn=mock.MagicMock(return_value=reg),
            polling_fn=mock.MagicMock(),
        )
        self.assertEqual(result.error_code, "REGISTRATION_START_FAILED")


class TestResultIncludesStartupReg(unittest.TestCase):
    """Case 3: result.startup_registration is the same object returned by start_fn."""

    def test_startup_registration_in_result(self) -> None:
        reg = _make_started_reg()
        result = retry_registration(
            startup_check=_fake_startup_check(),
            backend_url=BACKEND,
            callbacks=PollingCallbacks(),
            start_fn=mock.MagicMock(return_value=reg),
            polling_fn=mock.MagicMock(),
        )
        self.assertIs(result.startup_registration, reg)

    def test_startup_registration_none_on_failure(self) -> None:
        result = retry_registration(
            startup_check=_fake_startup_check(),
            backend_url=BACKEND,
            callbacks=PollingCallbacks(),
            start_fn=mock.MagicMock(return_value=_make_failed_reg()),
            polling_fn=mock.MagicMock(),
        )
        self.assertIsNone(result.startup_registration)


class TestArgsForwarded(unittest.TestCase):
    """Case 5: backend_url, client_version, platform forwarded to start_fn."""

    def test_args_forwarded_positionally(self) -> None:
        reg = _make_started_reg()
        start_fn = mock.MagicMock(return_value=reg)
        sc = _fake_startup_check()

        retry_registration(
            startup_check=sc,
            backend_url="http://custom:9000",
            callbacks=PollingCallbacks(),
            client_version="1.2.3",
            platform="linux",
            start_fn=start_fn,
            polling_fn=mock.MagicMock(),
        )

        start_fn.assert_called_once_with(sc, "http://custom:9000", "1.2.3", "linux")

    def test_defaults_client_version_and_platform(self) -> None:
        reg = _make_started_reg()
        start_fn = mock.MagicMock(return_value=reg)
        sc = _fake_startup_check()

        retry_registration(
            startup_check=sc,
            backend_url=BACKEND,
            callbacks=PollingCallbacks(),
            start_fn=start_fn,
            polling_fn=mock.MagicMock(),
        )

        start_fn.assert_called_once_with(sc, BACKEND, None, "windows")


class TestNoSensitiveOutput(unittest.TestCase):
    """Case 6: device_code, registration_url must not appear in stdout/stderr."""

    DEVICE_CODE = "dc_5K_MUST_NOT_APPEAR"
    REG_URL = "https://app.aigency.com/register?code=" + DEVICE_CODE

    def test_no_sensitive_output_on_success(self) -> None:
        reg = StartupRegistrationResult(
            attempted=True,
            started=True,
            device_code=self.DEVICE_CODE,
            registration_url=self.REG_URL,
            poll_interval_secs=5,
        )
        out, err = io.StringIO(), io.StringIO()
        with mock.patch("sys.stdout", out), mock.patch("sys.stderr", err):
            retry_registration(
                startup_check=_fake_startup_check(),
                backend_url=BACKEND,
                callbacks=PollingCallbacks(),
                start_fn=mock.MagicMock(return_value=reg),
                polling_fn=mock.MagicMock(),
            )
        combined = out.getvalue() + err.getvalue()
        self.assertNotIn(self.DEVICE_CODE, combined)
        self.assertNotIn(self.REG_URL, combined)

    def test_no_sensitive_output_on_failure(self) -> None:
        out, err = io.StringIO(), io.StringIO()
        with mock.patch("sys.stdout", out), mock.patch("sys.stderr", err):
            retry_registration(
                startup_check=_fake_startup_check(),
                backend_url=BACKEND,
                callbacks=PollingCallbacks(),
                start_fn=mock.MagicMock(return_value=_make_failed_reg()),
                polling_fn=mock.MagicMock(),
            )
        combined = out.getvalue() + err.getvalue()
        self.assertNotIn(self.DEVICE_CODE, combined)


if __name__ == "__main__":
    unittest.main()
