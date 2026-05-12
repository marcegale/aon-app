"""
Phase 5C — DeviceRegistrationFlow Tests

Runner (from atlas-agent/):
    python -m unittest tests.test_device_registration -v
    python -m unittest discover tests -v
"""
from __future__ import annotations

import os
import sys
import unittest
from unittest import mock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from device_client import ClientError, PollResult, StartResult
from device_registration import (
    DeviceRegistrationFlow,
    RegistrationFlowError,
    RegistrationStarted,
    generate_device_code,
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _ok(status: str, device_key: str | None = None) -> PollResult:
    return PollResult(ok=True, status=status, device_key=device_key)


def _err(code: str) -> PollResult:
    return PollResult(ok=False, error=ClientError(code=code, message=f"{code} occurred"))


def _make_flow(
    poll_sequence: list[PollResult],
    save_fn=None,
) -> tuple[DeviceRegistrationFlow, mock.MagicMock, list[str]]:
    """Return (flow, mock_client, saved_keys)."""
    client = mock.MagicMock()
    client.poll_registration.side_effect = poll_sequence
    saved: list[str] = []
    flow = DeviceRegistrationFlow(
        client=client,
        save_fn=save_fn if save_fn is not None else saved.append,
        sleep_fn=lambda _: None,
    )
    return flow, client, saved


# ── run_poll_loop ─────────────────────────────────────────────────────────────

class TestPollLoop(unittest.TestCase):

    def test_pending_then_approved_saves_and_returns_key(self) -> None:
        flow, _, saved = _make_flow([_ok("pending"), _ok("approved", "atl_secret")])
        result = flow.run_poll_loop("dc_test")
        self.assertEqual(result, "atl_secret")
        self.assertEqual(saved, ["atl_secret"])

    def test_expired_returns_none(self) -> None:
        flow, _, _ = _make_flow([_ok("expired")])
        self.assertIsNone(flow.run_poll_loop("dc_test"))

    def test_denied_returns_none(self) -> None:
        flow, _, _ = _make_flow([_ok("denied")])
        self.assertIsNone(flow.run_poll_loop("dc_test"))

    def test_network_error_retries_then_succeeds(self) -> None:
        flow, client, saved = _make_flow([
            _err("NETWORK_ERROR"),
            _err("NETWORK_ERROR"),
            _ok("approved", "atl_after_retry"),
        ])
        result = flow.run_poll_loop("dc_test")
        self.assertEqual(result, "atl_after_retry")
        self.assertEqual(client.poll_registration.call_count, 3)

    def test_http_error_stops_immediately(self) -> None:
        flow, client, _ = _make_flow([_err("HTTP_ERROR")])
        result = flow.run_poll_loop("dc_test")
        self.assertIsNone(result)
        self.assertEqual(client.poll_registration.call_count, 1)

    def test_max_polls_exhausted_returns_none(self) -> None:
        flow, client, _ = _make_flow([_ok("pending")] * 10)
        result = flow.run_poll_loop("dc_test", max_polls=3)
        self.assertIsNone(result)
        self.assertEqual(client.poll_registration.call_count, 3)

    def test_on_status_called_only_on_status_change(self) -> None:
        flow, _, _ = _make_flow([
            _ok("pending"),
            _ok("pending"),   # same — must not re-fire on_status
            _ok("approved", "atl_key"),
        ])
        statuses: list[str] = []
        flow.run_poll_loop("dc_test", on_status=statuses.append)
        self.assertEqual(statuses, ["pending", "approved"])

    def test_save_fn_called_with_correct_key(self) -> None:
        saved_keys: list[str] = []
        flow, _, _ = _make_flow(
            [_ok("approved", "atl_the_key")],
            save_fn=saved_keys.append,
        )
        flow.run_poll_loop("dc_test")
        self.assertEqual(saved_keys, ["atl_the_key"])

    def test_sleep_called_with_interval_seconds(self) -> None:
        sleep_calls: list[float] = []
        client = mock.MagicMock()
        client.poll_registration.side_effect = [_ok("pending"), _ok("approved", "atl_k")]
        flow = DeviceRegistrationFlow(
            client=client,
            save_fn=lambda _: None,
            sleep_fn=sleep_calls.append,
        )
        flow.run_poll_loop("dc_test", interval_seconds=7.5)
        self.assertEqual(sleep_calls, [7.5])


# ── start ─────────────────────────────────────────────────────────────────────

class TestDelegation(unittest.TestCase):

    def _flow(self) -> tuple[DeviceRegistrationFlow, mock.MagicMock]:
        client = mock.MagicMock()
        return DeviceRegistrationFlow(client=client, save_fn=lambda _: None, sleep_fn=lambda _: None), client

    def test_start_generates_device_code_and_returns_registration_started(self) -> None:
        flow, client = self._flow()
        client.start_registration.return_value = StartResult(
            ok=True,
            registration_url="https://example.com/register",
            expires_at="2024-06-01T12:00:00Z",
            poll_interval_secs=5,
        )
        with mock.patch("device_registration.generate_device_code", return_value="dc_mocked"):
            result = flow.start()
        client.start_registration.assert_called_once_with("dc_mocked", "windows", None)
        self.assertIsInstance(result, RegistrationStarted)
        self.assertEqual(result.device_code, "dc_mocked")
        self.assertEqual(result.registration_url, "https://example.com/register")
        self.assertEqual(result.expires_at, "2024-06-01T12:00:00Z")
        self.assertEqual(result.poll_interval_secs, 5)

    def test_start_error_returns_registration_flow_error(self) -> None:
        flow, client = self._flow()
        client.start_registration.return_value = StartResult(
            ok=False,
            error=ClientError(code="NETWORK_ERROR", message="Connection refused"),
        )
        result = flow.start()
        self.assertIsInstance(result, RegistrationFlowError)
        self.assertEqual(result.code, "NETWORK_ERROR")
        self.assertEqual(result.message, "Connection refused")

    def test_start_forwards_platform_and_client_version(self) -> None:
        flow, client = self._flow()
        client.start_registration.return_value = StartResult(ok=True)
        with mock.patch("device_registration.generate_device_code", return_value="dc_x"):
            flow.start(platform="linux", client_version="2.0.0")
        client.start_registration.assert_called_once_with("dc_x", "linux", "2.0.0")

    def test_poll_once_delegates_to_client(self) -> None:
        flow, client = self._flow()
        expected = PollResult(ok=True, status="pending")
        client.poll_registration.return_value = expected
        result = flow.poll_once("dc_abc")
        client.poll_registration.assert_called_once_with("dc_abc")
        self.assertIs(result, expected)


# ── generate_device_code ──────────────────────────────────────────────────────

class TestGenerateDeviceCode(unittest.TestCase):

    def test_returns_non_empty_hex_string(self) -> None:
        code = generate_device_code()
        self.assertIsInstance(code, str)
        self.assertTrue(len(code) > 0)
        int(code, 16)  # raises ValueError if not valid hex

    def test_returns_unique_values_on_each_call(self) -> None:
        codes = {generate_device_code() for _ in range(5)}
        self.assertEqual(len(codes), 5)

    def test_matches_backend_constraint_4_to_16_alphanumeric(self) -> None:
        """Backend /register/start and /register/poll require ^[A-Za-z0-9]{4,16}$."""
        import re
        pattern = re.compile(r"^[A-Za-z0-9]{4,16}$")
        for _ in range(20):
            code = generate_device_code()
            self.assertRegex(code, pattern, f"code {code!r} does not match backend constraint")


if __name__ == "__main__":
    unittest.main()
