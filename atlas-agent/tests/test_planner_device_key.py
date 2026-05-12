"""
Phase 5J — planner uses stored device key tests.

Runner (from atlas-agent/):
    python -m unittest tests.test_planner_device_key -v
    python -m unittest discover tests -v

No real network. No real keyring. Mocks load_device_key and urlopen.
"""
from __future__ import annotations

import io
import json
import os
import sys
import unittest
from unittest import mock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# Stub keyring so device_credentials imports cleanly without the library.
sys.modules.setdefault("keyring", mock.MagicMock())
sys.modules.setdefault("keyring.errors", mock.MagicMock())

import config.settings as settings
from planner import planner as planner_mod

# ── Helpers ───────────────────────────────────────────────────────────────────

BACKEND = "http://localhost:3000"
STORED_KEY = "atl_stored_from_keyring"
SETTINGS_KEY = "atl_from_settings_env"

_OK_RESPONSE = json.dumps({"ok": True, "response": "Hola!", "mode": "ai"}).encode()
_INVALID_KEY_RESPONSE = json.dumps(
    {"ok": False, "error": {"code": "INVALID_DEVICE_KEY", "message": "Bad key."}}
).encode()


def _mock_urlopen(body: bytes, status: int = 200):
    """Return a context-manager mock that yields a response with body."""
    resp = mock.MagicMock()
    resp.read.return_value = body
    resp.__enter__ = lambda s: s
    resp.__exit__ = mock.MagicMock(return_value=False)
    cm = mock.MagicMock()
    cm.return_value = resp
    return cm


def _patch_settings(backend=BACKEND, device_key=""):
    return mock.patch.multiple(
        settings,
        BACKEND_URL=backend,
        DEVICE_KEY=device_key,
    )


# ── Tests ─────────────────────────────────────────────────────────────────────

class TestUsesStoredKey(unittest.TestCase):
    """Case 1: load_device_key() value appears in payload."""

    def test_stored_key_sent_in_payload(self) -> None:
        captured: list[dict] = []

        def fake_urlopen(req, timeout=None):
            captured.append(json.loads(req.data.decode()))
            resp = mock.MagicMock()
            resp.read.return_value = _OK_RESPONSE
            resp.__enter__ = lambda s: s
            resp.__exit__ = mock.MagicMock(return_value=False)
            return resp

        with _patch_settings():
            with mock.patch("planner.planner.load_device_key", return_value=STORED_KEY):
                with mock.patch("urllib.request.urlopen", fake_urlopen):
                    planner_mod.plan("hola")

        self.assertEqual(len(captured), 1)
        self.assertEqual(captured[0]["device_key"], STORED_KEY)


class TestFallsBackToSettingsKey(unittest.TestCase):
    """Case 2: when load_device_key() returns None, settings.DEVICE_KEY is used."""

    def test_settings_key_used_when_store_empty(self) -> None:
        captured: list[dict] = []

        def fake_urlopen(req, timeout=None):
            captured.append(json.loads(req.data.decode()))
            resp = mock.MagicMock()
            resp.read.return_value = _OK_RESPONSE
            resp.__enter__ = lambda s: s
            resp.__exit__ = mock.MagicMock(return_value=False)
            return resp

        with _patch_settings(device_key=SETTINGS_KEY):
            with mock.patch("planner.planner.load_device_key", return_value=None):
                with mock.patch("urllib.request.urlopen", fake_urlopen):
                    planner_mod.plan("hola")

        self.assertEqual(len(captured), 1)
        self.assertEqual(captured[0]["device_key"], SETTINGS_KEY)


class TestStoredKeyTakesPrecedence(unittest.TestCase):
    """Case 1b: stored key wins over settings.DEVICE_KEY when both present."""

    def test_stored_key_wins(self) -> None:
        captured: list[dict] = []

        def fake_urlopen(req, timeout=None):
            captured.append(json.loads(req.data.decode()))
            resp = mock.MagicMock()
            resp.read.return_value = _OK_RESPONSE
            resp.__enter__ = lambda s: s
            resp.__exit__ = mock.MagicMock(return_value=False)
            return resp

        with _patch_settings(device_key=SETTINGS_KEY):
            with mock.patch("planner.planner.load_device_key", return_value=STORED_KEY):
                with mock.patch("urllib.request.urlopen", fake_urlopen):
                    planner_mod.plan("hola")

        self.assertEqual(captured[0]["device_key"], STORED_KEY)


class TestNoDeviceKeyLogged(unittest.TestCase):
    """Case 3: device_key value must not appear in log output."""

    def test_device_key_not_logged(self) -> None:
        import logging
        captured_logs: list[str] = []

        class _Capture(logging.Handler):
            def emit(self, record: logging.LogRecord) -> None:
                captured_logs.append(self.format(record))

        handler = _Capture()
        root = logging.getLogger()
        root.addHandler(handler)
        try:
            with _patch_settings():
                with mock.patch("planner.planner.load_device_key", return_value=STORED_KEY):
                    with mock.patch(
                        "urllib.request.urlopen",
                        _mock_urlopen(_OK_RESPONSE),
                    ):
                        planner_mod.plan("test prompt")
        finally:
            root.removeHandler(handler)

        combined = " ".join(captured_logs)
        self.assertNotIn(STORED_KEY, combined)


class TestPromptAndContextUnchanged(unittest.TestCase):
    """Case 4: prompt and context are forwarded unchanged."""

    def test_prompt_forwarded(self) -> None:
        captured: list[dict] = []

        def fake_urlopen(req, timeout=None):
            captured.append(json.loads(req.data.decode()))
            resp = mock.MagicMock()
            resp.read.return_value = _OK_RESPONSE
            resp.__enter__ = lambda s: s
            resp.__exit__ = mock.MagicMock(return_value=False)
            return resp

        with _patch_settings():
            with mock.patch("planner.planner.load_device_key", return_value=STORED_KEY):
                with mock.patch("urllib.request.urlopen", fake_urlopen):
                    planner_mod.plan("mi prompt exacto", context={"key": "val"})

        self.assertEqual(captured[0]["prompt"], "mi prompt exacto")
        self.assertEqual(captured[0]["context"], {"key": "val"})


class TestBackendSuccessResponse(unittest.TestCase):
    """Case 5: backend success response propagated correctly."""

    def test_ok_response_returned(self) -> None:
        with _patch_settings():
            with mock.patch("planner.planner.load_device_key", return_value=STORED_KEY):
                with mock.patch(
                    "urllib.request.urlopen",
                    _mock_urlopen(_OK_RESPONSE),
                ):
                    result = planner_mod.plan("hola")

        self.assertTrue(result["ok"])
        self.assertEqual(result["response"], "Hola!")
        self.assertEqual(result["mode"], "ai")


class TestInvalidDeviceKeyResponse(unittest.TestCase):
    """Case 6: INVALID_DEVICE_KEY error from backend is returned as-is."""

    def test_invalid_key_error_propagated(self) -> None:
        import urllib.error
        http_err = urllib.error.HTTPError(
            url="http://x", code=401, msg="Unauthorized",
            hdrs=None, fp=io.BytesIO(_INVALID_KEY_RESPONSE),
        )
        with _patch_settings():
            with mock.patch("planner.planner.load_device_key", return_value=STORED_KEY):
                with mock.patch("urllib.request.urlopen", side_effect=http_err):
                    result = planner_mod.plan("hola")

        self.assertFalse(result["ok"])
        self.assertEqual(result["error"]["code"], "INVALID_DEVICE_KEY")


class TestDoesNotCallSaveDeviceKey(unittest.TestCase):
    """Case 7: plan() must not call save_device_key()."""

    def test_save_not_called(self) -> None:
        with _patch_settings():
            with mock.patch("planner.planner.load_device_key", return_value=STORED_KEY):
                with mock.patch(
                    "urllib.request.urlopen",
                    _mock_urlopen(_OK_RESPONSE),
                ):
                    with mock.patch("device_credentials.save_device_key") as mock_save:
                        planner_mod.plan("hola")
        mock_save.assert_not_called()


class TestDoesNotCallClearDeviceKey(unittest.TestCase):
    """Case 8: plan() must not call clear_device_key()."""

    def test_clear_not_called(self) -> None:
        with _patch_settings():
            with mock.patch("planner.planner.load_device_key", return_value=STORED_KEY):
                with mock.patch(
                    "urllib.request.urlopen",
                    _mock_urlopen(_OK_RESPONSE),
                ):
                    with mock.patch("device_credentials.clear_device_key") as mock_clear:
                        planner_mod.plan("hola")
        mock_clear.assert_not_called()


class TestDoesNotStartRegistration(unittest.TestCase):
    """Case 9: plan() must not trigger any registration flow."""

    def test_no_registration_started(self) -> None:
        with _patch_settings():
            with mock.patch("planner.planner.load_device_key", return_value=STORED_KEY):
                with mock.patch(
                    "urllib.request.urlopen",
                    _mock_urlopen(_OK_RESPONSE),
                ):
                    with mock.patch("device_registration_startup.maybe_start_registration_from_startup_check") as mock_reg:
                        planner_mod.plan("hola")
        mock_reg.assert_not_called()


class TestNoSensitiveOutput(unittest.TestCase):
    """Case 10: device_key must not appear in stdout or stderr."""

    STORED = "atl_MUST_NOT_APPEAR_IN_STDOUT_5J"

    def test_device_key_not_in_stdout_or_stderr(self) -> None:
        out, err = io.StringIO(), io.StringIO()
        with mock.patch("sys.stdout", out), mock.patch("sys.stderr", err):
            with _patch_settings():
                with mock.patch("planner.planner.load_device_key", return_value=self.STORED):
                    with mock.patch(
                        "urllib.request.urlopen",
                        _mock_urlopen(_OK_RESPONSE),
                    ):
                        planner_mod.plan("hola")

        combined = out.getvalue() + err.getvalue()
        self.assertNotIn(self.STORED, combined)


if __name__ == "__main__":
    unittest.main()
