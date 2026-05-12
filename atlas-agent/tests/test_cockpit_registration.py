"""
Phase 5H — CockpitWindow registration card tests.

Runner (from atlas-agent/):
    python -m unittest tests.test_cockpit_registration -v
    python -m unittest discover tests -v

No real webview imported. _win is mocked; evaluate_js/show are captured.
"""
from __future__ import annotations

import json
import logging
import os
import sys
import unittest
from unittest import mock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# Stub webview before importing cockpit_window so the module-level
# `import webview` and the `webview.Window` annotation resolve safely.
sys.modules.setdefault("webview", mock.MagicMock())

from device_registration_startup import StartupRegistrationResult  # noqa: E402
from ui.cockpit.cockpit_window import CockpitWindow               # noqa: E402

# ── Fixtures ──────────────────────────────────────────────────────────────────

REG = StartupRegistrationResult(
    attempted=True,
    started=True,
    device_code="dc_test_abc123",
    registration_url="https://app.aigency.com/register?code=dc_test_abc123",
    expires_at="2024-06-01T12:00:00Z",
    poll_interval_secs=5,
)


def _cockpit_ready() -> CockpitWindow:
    cw = CockpitWindow()
    cw._win = mock.MagicMock()
    cw._ready = True
    return cw


def _cockpit_not_ready() -> CockpitWindow:
    cw = CockpitWindow()
    cw._win = mock.MagicMock()
    cw._ready = False
    return cw


# ── Tests ─────────────────────────────────────────────────────────────────────

def _find_reg_card_call(cw: CockpitWindow) -> str | None:
    """Return the showRegistrationCard JS string from evaluate_js calls, or None."""
    prefix = "window.showRegistrationCard("
    for c in cw._win.evaluate_js.call_args_list:
        arg = c[0][0]
        if arg.startswith(prefix):
            return arg
    return None


class TestShowImmediateWhenReady(unittest.TestCase):
    """Case 1 + 8: ready=True → evaluate_js called immediately with correct content.

    Note: _emit_registration_card also calls open() which triggers a second
    evaluate_js (setTimeout focusInput). Tests search call_args_list for the
    showRegistrationCard call specifically.
    """

    def test_evaluate_js_called(self) -> None:
        cw = _cockpit_ready()
        cw.show_registration_card(REG)
        self.assertTrue(cw._win.evaluate_js.called)

    def test_emitted_js_calls_show_registration_card(self) -> None:
        cw = _cockpit_ready()
        cw.show_registration_card(REG)
        self.assertIsNotNone(_find_reg_card_call(cw))

    def test_emitted_json_contains_expected_fields(self) -> None:
        cw = _cockpit_ready()
        cw.show_registration_card(REG)
        arg = _find_reg_card_call(cw)
        self.assertIsNotNone(arg)
        prefix = "window.showRegistrationCard("
        json_str = arg[len(prefix):-1]
        data = json.loads(json_str)
        self.assertEqual(data["device_code"], REG.device_code)
        self.assertEqual(data["registration_url"], REG.registration_url)
        self.assertEqual(data["expires_at"], REG.expires_at)
        self.assertEqual(data["poll_interval_secs"], REG.poll_interval_secs)


class TestDeferredWhenNotReady(unittest.TestCase):
    """Case 2: ready=False → no JS until _on_loaded fires."""

    def test_no_js_before_on_loaded(self) -> None:
        cw = _cockpit_not_ready()
        cw.show_registration_card(REG)
        cw._win.evaluate_js.assert_not_called()

    def test_js_emitted_after_on_loaded(self) -> None:
        cw = _cockpit_not_ready()
        cw.show_registration_card(REG)
        cw._on_loaded()
        self.assertIsNotNone(_find_reg_card_call(cw))

    def test_no_js_if_no_pending_reg_on_loaded(self) -> None:
        cw = _cockpit_not_ready()
        cw._on_loaded()
        cw._win.evaluate_js.assert_not_called()


class TestAutoOpen(unittest.TestCase):
    """Case 3: auto-opens cockpit when not visible."""

    def test_opens_when_not_visible(self) -> None:
        cw = _cockpit_ready()
        cw._visible = False
        cw.show_registration_card(REG)
        cw._win.show.assert_called_once()

    def test_does_not_open_if_already_visible(self) -> None:
        """Case 4: already visible → no extra show() call."""
        cw = _cockpit_ready()
        cw._visible = True
        cw.show_registration_card(REG)
        cw._win.show.assert_not_called()


class TestNoSensitiveLogging(unittest.TestCase):
    """Cases 5 + 9: device_code and registration_url must not appear in log output."""

    def test_device_code_and_url_not_logged(self) -> None:
        cw = _cockpit_ready()
        captured: list[str] = []

        class _Capture(logging.Handler):
            def emit(self, record: logging.LogRecord) -> None:
                captured.append(self.format(record))

        handler = _Capture()
        root = logging.getLogger()
        root.addHandler(handler)
        try:
            cw.show_registration_card(REG)
        finally:
            root.removeHandler(handler)

        combined = " ".join(captured)
        self.assertNotIn(REG.device_code, combined)
        self.assertNotIn(REG.registration_url, combined)


class TestHideRegistrationCard(unittest.TestCase):
    """Case 6: hide_registration_card emits window.hideRegistrationCard()."""

    def test_hide_calls_js(self) -> None:
        cw = _cockpit_ready()
        cw.hide_registration_card()
        cw._win.evaluate_js.assert_called_once()
        arg = cw._win.evaluate_js.call_args[0][0]
        self.assertIn("hideRegistrationCard", arg)

    def test_hide_does_nothing_when_not_ready(self) -> None:
        cw = _cockpit_not_ready()
        cw.hide_registration_card()
        cw._win.evaluate_js.assert_not_called()


class TestPendingRegStorage(unittest.TestCase):
    """Case 7: _pending_reg is stored correctly."""

    def test_pending_reg_none_by_default(self) -> None:
        cw = CockpitWindow()
        self.assertIsNone(cw._pending_reg)

    def test_pending_reg_set_on_show(self) -> None:
        cw = _cockpit_not_ready()
        self.assertIsNone(cw._pending_reg)
        cw.show_registration_card(REG)
        self.assertIs(cw._pending_reg, REG)

    def test_pending_reg_retained_until_cleared(self) -> None:
        cw = _cockpit_not_ready()
        cw.show_registration_card(REG)
        self.assertIs(cw._pending_reg, REG)
        # _on_loaded fires but _pending_reg is not cleared (hide is separate)
        cw._on_loaded()
        self.assertIs(cw._pending_reg, REG)


class TestShowRegistrationStatus(unittest.TestCase):
    """Phase 5I: show_registration_status emits updateRegistrationStatus."""

    def test_emits_update_status_when_ready(self) -> None:
        cw = _cockpit_ready()
        cw.show_registration_status("pending")
        args = [c[0][0] for c in cw._win.evaluate_js.call_args_list]
        self.assertTrue(any("updateRegistrationStatus" in a for a in args))

    def test_stores_pending_status(self) -> None:
        cw = _cockpit_not_ready()
        cw.show_registration_status("pending")
        self.assertEqual(cw._pending_reg_status, "pending")

    def test_deferred_status_emitted_on_loaded(self) -> None:
        cw = _cockpit_not_ready()
        cw.show_registration_status("approved")
        cw._win.evaluate_js.assert_not_called()
        cw._on_loaded()
        args = [c[0][0] for c in cw._win.evaluate_js.call_args_list]
        self.assertTrue(any("updateRegistrationStatus" in a for a in args))


class TestShowRegistrationSuccess(unittest.TestCase):
    """Phase 5I: show_registration_success emits showRegistrationSuccess."""

    def test_emits_show_registration_success(self) -> None:
        cw = _cockpit_ready()
        cw.show_registration_success()
        cw._win.evaluate_js.assert_called_once()
        arg = cw._win.evaluate_js.call_args[0][0]
        self.assertIn("showRegistrationSuccess", arg)

    def test_does_nothing_when_not_ready(self) -> None:
        cw = _cockpit_not_ready()
        cw.show_registration_success()
        cw._win.evaluate_js.assert_not_called()


class TestShowRegistrationFailed(unittest.TestCase):
    """Phase 5I: show_registration_failed emits showRegistrationFailed with JSON."""

    def test_emits_show_registration_failed(self) -> None:
        cw = _cockpit_ready()
        cw.show_registration_failed("REGISTRATION_NOT_COMPLETED", "Did not complete.")
        cw._win.evaluate_js.assert_called_once()
        arg = cw._win.evaluate_js.call_args[0][0]
        self.assertIn("showRegistrationFailed", arg)

    def test_emitted_json_contains_code_and_message(self) -> None:
        cw = _cockpit_ready()
        cw.show_registration_failed("SOME_ERROR", "Something went wrong.")
        arg = cw._win.evaluate_js.call_args[0][0]
        prefix = "window.showRegistrationFailed("
        self.assertTrue(arg.startswith(prefix))
        data = json.loads(arg[len(prefix):-1])
        self.assertEqual(data["code"], "SOME_ERROR")
        self.assertEqual(data["message"], "Something went wrong.")

    def test_does_nothing_when_not_ready(self) -> None:
        cw = _cockpit_not_ready()
        cw.show_registration_failed("ERR", "msg")
        cw._win.evaluate_js.assert_not_called()


class _SyncThread:
    """Runs target synchronously on start() — avoids threading in tests."""
    def __init__(self, target=None, daemon=None, **kw):
        self._target = target
    def start(self):
        if self._target:
            self._target()
    def join(self, timeout=None):
        pass


class TestRegistrationRetryCallback(unittest.TestCase):
    """Phase 5K: retry callback registration and _CockpitAPI.retry_registration."""

    def test_set_retry_callback_stores_fn(self) -> None:
        cw = CockpitWindow()
        fn = mock.MagicMock()
        cw.set_registration_retry_callback(fn)
        self.assertIs(cw._registration_retry_callback, fn)

    def test_retry_callback_none_by_default(self) -> None:
        cw = CockpitWindow()
        self.assertIsNone(cw._registration_retry_callback)

    def test_api_retry_calls_callback(self) -> None:
        cw = _cockpit_ready()
        called: list[bool] = []
        cw.set_registration_retry_callback(lambda: called.append(True))

        with mock.patch("ui.cockpit.cockpit_window.threading.Thread", _SyncThread):
            result = cw._api.retry_registration()

        self.assertEqual(called, [True])
        self.assertEqual(result, {"ok": True})

    def test_api_retry_returns_ok_true(self) -> None:
        cw = _cockpit_ready()
        cw.set_registration_retry_callback(lambda: None)

        with mock.patch("ui.cockpit.cockpit_window.threading.Thread", _SyncThread):
            result = cw._api.retry_registration()

        self.assertTrue(result.get("ok"))

    def test_api_retry_returns_ok_false_when_no_callback(self) -> None:
        cw = _cockpit_ready()
        # no callback set
        result = cw._api.retry_registration()
        self.assertFalse(result.get("ok"))
        self.assertIn("error", result)

    def test_api_retry_no_callback_does_not_raise(self) -> None:
        cw = CockpitWindow()
        cw._win = mock.MagicMock()
        # Should return a dict, not raise
        result = cw._api.retry_registration()
        self.assertIsInstance(result, dict)


if __name__ == "__main__":
    unittest.main()
