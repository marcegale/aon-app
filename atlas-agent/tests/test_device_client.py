"""
Phase 5C — AtlasDeviceClient Tests

Runner (from atlas-agent/):
    python -m unittest tests.test_device_client -v
    python -m unittest discover tests -v
"""
from __future__ import annotations

import io
import json
import os
import sys
import unittest
import urllib.error
from unittest import mock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from device_client import AtlasDeviceClient, ClientError, PollResult, StartResult

BASE_URL = "http://localhost:3000"


def _mock_response(body: dict, status: int = 200) -> mock.MagicMock:
    """Build a MagicMock that satisfies `with urlopen(...) as resp:`"""
    resp = mock.MagicMock()
    resp.read.return_value = json.dumps(body).encode("utf-8")
    resp.getcode.return_value = status
    resp.__enter__.return_value = resp
    resp.__exit__.return_value = False
    return resp


def _mock_http_error(code: int, body: dict | None = None) -> urllib.error.HTTPError:
    fp = io.BytesIO(json.dumps(body).encode("utf-8") if body else b"")
    return urllib.error.HTTPError(
        url=BASE_URL,
        code=code,
        msg=f"HTTP Error {code}",
        hdrs={},  # type: ignore[arg-type]
        fp=fp,
    )


# ── start_registration ────────────────────────────────────────────────────────

class TestStartRegistration(unittest.TestCase):

    def setUp(self) -> None:
        self.client = AtlasDeviceClient(BASE_URL)

    def test_success_200_returns_all_fields(self) -> None:
        body = {
            "registration_url": "https://example.com/register",
            "expires_at": "2024-06-01T12:00:00Z",
            "poll_interval_secs": 5,
        }
        with mock.patch("urllib.request.urlopen", return_value=_mock_response(body)):
            result = self.client.start_registration("dc_abc123")
        self.assertTrue(result.ok)
        self.assertEqual(result.registration_url, "https://example.com/register")
        self.assertEqual(result.expires_at, "2024-06-01T12:00:00Z")
        self.assertEqual(result.poll_interval_secs, 5)
        self.assertIsNone(result.error)

    def test_http_error_409_returns_http_error_with_message(self) -> None:
        with mock.patch("urllib.request.urlopen",
                        side_effect=_mock_http_error(409, {"error": "already_registered"})):
            result = self.client.start_registration("dev-001")
        self.assertFalse(result.ok)
        self.assertEqual(result.error.code, "HTTP_ERROR")
        self.assertIn("already_registered", result.error.message)

    def test_url_error_returns_network_error(self) -> None:
        exc = urllib.error.URLError(reason="Connection refused")
        with mock.patch("urllib.request.urlopen", side_effect=exc):
            result = self.client.start_registration("dev-001")
        self.assertFalse(result.ok)
        self.assertEqual(result.error.code, "NETWORK_ERROR")

    def test_malformed_json_returns_invalid_response(self) -> None:
        resp = mock.MagicMock()
        resp.read.return_value = b"not-json"
        resp.getcode.return_value = 200
        resp.__enter__.return_value = resp
        resp.__exit__.return_value = False
        with mock.patch("urllib.request.urlopen", return_value=resp):
            result = self.client.start_registration("dev-001")
        self.assertFalse(result.ok)
        self.assertEqual(result.error.code, "INVALID_RESPONSE")


# ── poll_registration ─────────────────────────────────────────────────────────

class TestPollRegistration(unittest.TestCase):

    def setUp(self) -> None:
        self.client = AtlasDeviceClient(BASE_URL)

    def test_pending_status_has_no_device_key(self) -> None:
        body = {"status": "pending"}
        with mock.patch("urllib.request.urlopen", return_value=_mock_response(body)):
            result = self.client.poll_registration("dc_abc")
        self.assertTrue(result.ok)
        self.assertEqual(result.status, "pending")
        self.assertIsNone(result.device_key)

    def test_approved_status_includes_device_key(self) -> None:
        body = {"status": "approved", "device_key": "atl_secretkey123"}
        with mock.patch("urllib.request.urlopen", return_value=_mock_response(body)):
            result = self.client.poll_registration("dc_abc")
        self.assertTrue(result.ok)
        self.assertEqual(result.status, "approved")
        self.assertEqual(result.device_key, "atl_secretkey123")

    def test_expired_status(self) -> None:
        body = {"status": "expired"}
        with mock.patch("urllib.request.urlopen", return_value=_mock_response(body)):
            result = self.client.poll_registration("dc_abc")
        self.assertTrue(result.ok)
        self.assertEqual(result.status, "expired")

    def test_http_error_404_returns_http_error(self) -> None:
        with mock.patch("urllib.request.urlopen", side_effect=_mock_http_error(404)):
            result = self.client.poll_registration("dc_abc")
        self.assertFalse(result.ok)
        self.assertEqual(result.error.code, "HTTP_ERROR")

    def test_url_error_returns_network_error(self) -> None:
        exc = urllib.error.URLError(reason="Network unreachable")
        with mock.patch("urllib.request.urlopen", side_effect=exc):
            result = self.client.poll_registration("dc_abc")
        self.assertFalse(result.ok)
        self.assertEqual(result.error.code, "NETWORK_ERROR")

    def test_http_error_with_json_body_extracts_error_field(self) -> None:
        with mock.patch("urllib.request.urlopen",
                        side_effect=_mock_http_error(422, {"error": "invalid_device_code"})):
            result = self.client.poll_registration("dc_abc")
        self.assertFalse(result.ok)
        self.assertEqual(result.error.code, "HTTP_ERROR")
        self.assertIn("invalid_device_code", result.error.message)

    def test_malformed_json_returns_invalid_response(self) -> None:
        resp = mock.MagicMock()
        resp.read.return_value = b"{broken"
        resp.getcode.return_value = 200
        resp.__enter__.return_value = resp
        resp.__exit__.return_value = False
        with mock.patch("urllib.request.urlopen", return_value=resp):
            result = self.client.poll_registration("dc_abc")
        self.assertFalse(result.ok)
        self.assertEqual(result.error.code, "INVALID_RESPONSE")


if __name__ == "__main__":
    unittest.main()
