"""
Phase 5F — AtlasDeviceAuthClient Tests

Runner (from atlas-agent/):
    python -m unittest tests.test_device_auth_client -v
    python -m unittest discover tests -v

No real network, no real backend.
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

from device_auth_client import AtlasDeviceAuthClient

BASE_URL = "http://localhost:3000"
CHECK_PATH = "/api/atlas/devices/auth/check"
FAKE_KEY = "atl_FAKE_KEY_DO_NOT_LOG"


def _mock_response(body: dict, status: int = 200) -> mock.MagicMock:
    """Build a MagicMock that satisfies `with urlopen(...) as resp:`"""
    resp = mock.MagicMock()
    resp.read.return_value = json.dumps(body).encode("utf-8")
    resp.getcode.return_value = status
    resp.__enter__.return_value = resp
    resp.__exit__.return_value = False
    return resp


def _mock_http_error(code: int, body: dict) -> urllib.error.HTTPError:
    fp = io.BytesIO(json.dumps(body).encode("utf-8"))
    return urllib.error.HTTPError(
        url=BASE_URL + CHECK_PATH,
        code=code,
        msg=f"HTTP Error {code}",
        hdrs={},  # type: ignore[arg-type]
        fp=fp,
    )


def _client() -> AtlasDeviceAuthClient:
    return AtlasDeviceAuthClient(BASE_URL)


# ── URL / request construction ────────────────────────────────────────────────

class TestRequestConstruction(unittest.TestCase):

    def test_sends_post_to_auth_check_endpoint(self) -> None:
        captured: list[urllib.request.Request] = []

        def fake_urlopen(req, timeout=None):
            captured.append(req)
            return _mock_response({"ok": True})

        with mock.patch("urllib.request.urlopen", side_effect=fake_urlopen):
            _client().validate_device_key(FAKE_KEY)

        self.assertEqual(len(captured), 1)
        self.assertIn(CHECK_PATH, captured[0].full_url)
        self.assertEqual(captured[0].get_method(), "POST")

    def test_request_body_contains_device_key_field(self) -> None:
        captured: list[bytes] = []

        def fake_urlopen(req, timeout=None):
            captured.append(req.data)
            return _mock_response({"ok": True})

        with mock.patch("urllib.request.urlopen", side_effect=fake_urlopen):
            _client().validate_device_key(FAKE_KEY)

        body = json.loads(captured[0])
        self.assertIn("device_key", body)


# ── Success path ──────────────────────────────────────────────────────────────

class TestSuccessPath(unittest.TestCase):

    def test_200_ok_true_returns_ok_dict(self) -> None:
        with mock.patch("urllib.request.urlopen", return_value=_mock_response({"ok": True, "status": "active"})):
            result = _client().validate_device_key(FAKE_KEY)
        self.assertEqual(result, {"ok": True})


# ── Error code mapping ────────────────────────────────────────────────────────

class TestErrorMapping(unittest.TestCase):

    def _run_with_http_error(self, http_code: int, error_code: str) -> dict:
        body = {"ok": False, "error": {"code": error_code, "message": "err"}}
        exc = _mock_http_error(http_code, body)
        with mock.patch("urllib.request.urlopen", side_effect=exc):
            return _client().validate_device_key(FAKE_KEY)

    def test_401_invalid_device_key(self) -> None:
        result = self._run_with_http_error(401, "INVALID_DEVICE_KEY")
        self.assertFalse(result.get("ok"))
        self.assertEqual(result.get("code"), "INVALID_DEVICE_KEY")

    def test_401_device_revoked(self) -> None:
        result = self._run_with_http_error(401, "DEVICE_REVOKED")
        self.assertFalse(result.get("ok"))
        self.assertEqual(result.get("code"), "DEVICE_REVOKED")

    def test_503_device_auth_unavailable(self) -> None:
        result = self._run_with_http_error(503, "DEVICE_AUTH_UNAVAILABLE")
        self.assertFalse(result.get("ok"))
        self.assertEqual(result.get("code"), "DEVICE_AUTH_UNAVAILABLE")

    def test_url_error_returns_network_error(self) -> None:
        exc = urllib.error.URLError(reason="Connection refused")
        with mock.patch("urllib.request.urlopen", side_effect=exc):
            result = _client().validate_device_key(FAKE_KEY)
        self.assertFalse(result.get("ok"))
        self.assertEqual(result.get("code"), "NETWORK_ERROR")

    def test_timeout_error_returns_network_error(self) -> None:
        with mock.patch("urllib.request.urlopen", side_effect=TimeoutError("timed out")):
            result = _client().validate_device_key(FAKE_KEY)
        self.assertFalse(result.get("ok"))
        self.assertEqual(result.get("code"), "NETWORK_ERROR")

    def test_malformed_json_response_returns_invalid_response(self) -> None:
        resp = mock.MagicMock()
        resp.read.return_value = b"{not-json"
        resp.__enter__.return_value = resp
        resp.__exit__.return_value = False
        with mock.patch("urllib.request.urlopen", return_value=resp):
            result = _client().validate_device_key(FAKE_KEY)
        self.assertFalse(result.get("ok"))
        self.assertEqual(result.get("code"), "INVALID_RESPONSE")


# ── Security: no raw key in output ───────────────────────────────────────────

class TestNoKeyLogging(unittest.TestCase):

    SENSITIVE = "atl_SENSITIVE_KEY_5F_MUST_NOT_APPEAR"

    def _capture(self, fn) -> str:
        out, err = io.StringIO(), io.StringIO()
        with mock.patch("sys.stdout", out), mock.patch("sys.stderr", err):
            try:
                fn()
            except Exception:
                pass
        return out.getvalue() + err.getvalue()

    def test_key_not_logged_on_success(self) -> None:
        resp = _mock_response({"ok": True})
        with mock.patch("urllib.request.urlopen", return_value=resp):
            output = self._capture(lambda: _client().validate_device_key(self.SENSITIVE))
        self.assertNotIn(self.SENSITIVE, output)

    def test_key_not_logged_on_network_error(self) -> None:
        exc = urllib.error.URLError(reason="unreachable")
        with mock.patch("urllib.request.urlopen", side_effect=exc):
            output = self._capture(lambda: _client().validate_device_key(self.SENSITIVE))
        self.assertNotIn(self.SENSITIVE, output)


if __name__ == "__main__":
    unittest.main()
