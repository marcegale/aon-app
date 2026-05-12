"""
Phase 5L — Desktop registration flow readiness hardening.

End-to-end simulation tests covering the full registration lifecycle
without real network, keyring, or webview.

Checks covered:
  1. Full registration simulation (unregistered → approved → key saved)
  2. Revoked key recovery (clear → re-register → new key)
  3. Expired poll then successful retry
  4. Offline behavior (no registration triggered, key retained)
  5. No secret leakage (stdout/stderr/logging)
  6. No duplicate polling (concurrent retry guard)
  7. Callback / thread safety (deferred card, no raises when not ready)
  8. Planner no side effects (only loads key, no save/clear/register)

Runner (from atlas-agent/):
    python -m unittest tests.test_registration_flow_readiness -v
    python -m unittest discover tests -v
"""
from __future__ import annotations

import io
import json
import logging
import os
import sys
import threading
import time
import unittest
from unittest import mock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# Stub webview and keyring before any module import
sys.modules.setdefault("webview", mock.MagicMock())
sys.modules.setdefault("keyring", mock.MagicMock())
sys.modules.setdefault("keyring.errors", mock.MagicMock())

import config.settings as settings
from device_registration_polling import PollingCallbacks
from device_registration_recovery import retry_registration
from device_registration_startup import StartupRegistrationResult
from device_startup import run_startup_device_check
from device_state import DeviceState
from ui.cockpit.cockpit_window import CockpitWindow

# ── Fakes ──────────────────────────────────────────────────────────────────────


class FakeCredentialStore:
    """In-memory credential store that tracks all operations."""

    def __init__(self, initial_key: str | None = None) -> None:
        self._key = initial_key
        self.saves: list[str] = []
        self.clears: int = 0
        self.loads: int = 0

    def load(self) -> str | None:
        self.loads += 1
        return self._key

    def save(self, key: str) -> None:
        self._key = key
        self.saves.append(key)

    def clear(self) -> None:
        self._key = None
        self.clears += 1


class FakeCockpit:
    """Records all registration UI calls without touching webview."""

    def __init__(self) -> None:
        self.registration_cards: list = []
        self.statuses: list[str] = []
        self.successes: int = 0
        self.failures: list[tuple] = []
        self._retry_callback = None

    def show_registration_card(self, reg) -> None:
        self.registration_cards.append(reg)

    def show_registration_status(self, status: str) -> None:
        self.statuses.append(status)

    def show_registration_success(self) -> None:
        self.successes += 1

    def show_registration_failed(self, code: str, msg: str) -> None:
        self.failures.append((code, msg))

    def set_registration_retry_callback(self, fn) -> None:
        self._retry_callback = fn


# ── Helpers ────────────────────────────────────────────────────────────────────


def _started_reg(device_code: str = "dc_5L_test") -> StartupRegistrationResult:
    return StartupRegistrationResult(
        attempted=True,
        started=True,
        device_code=device_code,
        registration_url="https://app.aigency.com/r?code=" + device_code,
        expires_at="2026-06-01T00:00:00Z",
        poll_interval_secs=5,
    )


def _failed_reg(code: str = "START_FAIL") -> StartupRegistrationResult:
    return StartupRegistrationResult(
        attempted=True, started=False,
        error_code=code, message="Start failed.",
    )


def _sync_poll(statuses: list[str], key: str | None, store: FakeCredentialStore | None = None):
    """Returns a polling_fn that fires callbacks synchronously."""
    def polling_fn(startup_registration, backend_url, callbacks):
        for s in statuses:
            if callbacks and callbacks.on_status:
                callbacks.on_status(s)
        if key is not None:
            if store:
                store.save(key)
            if callbacks and callbacks.on_registered:
                callbacks.on_registered()
        else:
            if callbacks and callbacks.on_failed:
                callbacks.on_failed("REGISTRATION_NOT_COMPLETED", "Did not complete.")
        return mock.MagicMock()
    return polling_fn


def _do_flow(startup_check, cockpit, store, backend_url, start_fn, poll_fn):
    """Run retry_registration and show card — mirrors atlas.py _begin_registration_flow."""
    cbs = PollingCallbacks(
        on_status=cockpit.show_registration_status,
        on_registered=cockpit.show_registration_success,
        on_failed=lambda c, m: cockpit.show_registration_failed(c, m),
    )
    result = retry_registration(
        startup_check=startup_check,
        backend_url=backend_url,
        callbacks=cbs,
        start_fn=start_fn,
        polling_fn=poll_fn,
    )
    if result.started and result.startup_registration is not None:
        cockpit.show_registration_card(result.startup_registration)
    return result


def _make_ok_urlopen() -> mock.MagicMock:
    resp = mock.MagicMock()
    resp.read.return_value = json.dumps({"ok": True, "response": "ok", "mode": "ai"}).encode()
    resp.__enter__ = lambda s: s
    resp.__exit__ = mock.MagicMock(return_value=False)
    return mock.MagicMock(return_value=resp)


# ── Check 1: Full registration simulation ─────────────────────────────────────


class TestFullRegistrationSimulation(unittest.TestCase):
    """Check 1: unregistered → start → poll approved → key saved → cockpit success."""

    DEVICE_CODE = "dc_full_sim_5L"
    DEVICE_KEY = "atl_full_sim_key_5L"
    BACKEND = "http://localhost:3000"

    def setUp(self) -> None:
        self.store = FakeCredentialStore()
        self.cockpit = FakeCockpit()
        self.startup = run_startup_device_check(
            validate_device_key_fn=lambda k: {"ok": True},
            load_device_key_fn=self.store.load,
            clear_device_key_fn=self.store.clear,
        )

    def test_startup_state_unregistered(self) -> None:
        self.assertEqual(self.startup.result.state, DeviceState.UNREGISTERED)
        self.assertTrue(self.startup.should_start_registration)
        self.assertFalse(self.startup.should_allow_planner)

    def test_registration_card_shown_with_device_code(self) -> None:
        _do_flow(
            self.startup, self.cockpit, self.store, self.BACKEND,
            start_fn=lambda sc, url, cv, p: _started_reg(self.DEVICE_CODE),
            poll_fn=_sync_poll(["pending"], self.DEVICE_KEY, self.store),
        )
        self.assertEqual(len(self.cockpit.registration_cards), 1)
        self.assertEqual(self.cockpit.registration_cards[0].device_code, self.DEVICE_CODE)

    def test_poll_status_propagated_to_cockpit(self) -> None:
        _do_flow(
            self.startup, self.cockpit, self.store, self.BACKEND,
            start_fn=lambda sc, url, cv, p: _started_reg(self.DEVICE_CODE),
            poll_fn=_sync_poll(["pending", "pending"], self.DEVICE_KEY, self.store),
        )
        self.assertIn("pending", self.cockpit.statuses)

    def test_success_called_once_on_approval(self) -> None:
        _do_flow(
            self.startup, self.cockpit, self.store, self.BACKEND,
            start_fn=lambda sc, url, cv, p: _started_reg(self.DEVICE_CODE),
            poll_fn=_sync_poll(["pending", "approved"], self.DEVICE_KEY, self.store),
        )
        self.assertEqual(self.cockpit.successes, 1)
        self.assertEqual(self.cockpit.failures, [])

    def test_key_saved_exactly_once(self) -> None:
        _do_flow(
            self.startup, self.cockpit, self.store, self.BACKEND,
            start_fn=lambda sc, url, cv, p: _started_reg(self.DEVICE_CODE),
            poll_fn=_sync_poll([], self.DEVICE_KEY, self.store),
        )
        self.assertEqual(self.store.saves, [self.DEVICE_KEY])

    def test_stored_key_readable_after_registration(self) -> None:
        _do_flow(
            self.startup, self.cockpit, self.store, self.BACKEND,
            start_fn=lambda sc, url, cv, p: _started_reg(self.DEVICE_CODE),
            poll_fn=_sync_poll([], self.DEVICE_KEY, self.store),
        )
        self.assertEqual(self.store.load(), self.DEVICE_KEY)


# ── Check 2: Revoked key recovery ─────────────────────────────────────────────


class TestRevokedKeyRecovery(unittest.TestCase):
    """Check 2: local key revoked → cleared → re-register → new key saved."""

    OLD_KEY = "atl_revoked_old_key"
    NEW_CODE = "dc_post_revoke"
    NEW_KEY = "atl_new_after_revoke"
    BACKEND = "http://localhost:3000"

    def setUp(self) -> None:
        self.store = FakeCredentialStore(initial_key=self.OLD_KEY)

    def test_revoked_state_and_flags(self) -> None:
        startup = run_startup_device_check(
            validate_device_key_fn=lambda k: {"ok": False, "code": "DEVICE_REVOKED"},
            load_device_key_fn=self.store.load,
            clear_device_key_fn=self.store.clear,
        )
        self.assertEqual(startup.result.state, DeviceState.REVOKED)
        self.assertTrue(startup.should_start_registration)
        self.assertFalse(startup.should_allow_planner)

    def test_old_key_cleared_on_revoke(self) -> None:
        run_startup_device_check(
            validate_device_key_fn=lambda k: {"ok": False, "code": "DEVICE_REVOKED"},
            load_device_key_fn=self.store.load,
            clear_device_key_fn=self.store.clear,
        )
        self.assertEqual(self.store.clears, 1)
        self.assertIsNone(self.store.load())

    def test_new_key_saved_after_re_registration(self) -> None:
        startup = run_startup_device_check(
            validate_device_key_fn=lambda k: {"ok": False, "code": "DEVICE_REVOKED"},
            load_device_key_fn=self.store.load,
            clear_device_key_fn=self.store.clear,
        )
        cockpit = FakeCockpit()
        _do_flow(
            startup, cockpit, self.store, self.BACKEND,
            start_fn=lambda sc, url, cv, p: _started_reg(self.NEW_CODE),
            poll_fn=_sync_poll([], self.NEW_KEY, self.store),
        )
        self.assertEqual(self.store.saves, [self.NEW_KEY])
        self.assertEqual(self.store.load(), self.NEW_KEY)
        self.assertEqual(cockpit.successes, 1)
        self.assertEqual(cockpit.failures, [])


# ── Check 3: Expired then retry ───────────────────────────────────────────────


class TestExpiredThenRetry(unittest.TestCase):
    """Check 3: poll expires → failure shown → retry → second poll approved → key saved once."""

    BACKEND = "http://localhost:3000"
    RETRY_KEY = "atl_retry_after_expired"

    def setUp(self) -> None:
        self.store = FakeCredentialStore()
        self.cockpit = FakeCockpit()
        self.startup = run_startup_device_check(
            validate_device_key_fn=lambda k: {"ok": True},
            load_device_key_fn=self.store.load,
            clear_device_key_fn=self.store.clear,
        )

    def test_first_attempt_expired_shows_failure(self) -> None:
        _do_flow(
            self.startup, self.cockpit, self.store, self.BACKEND,
            start_fn=lambda sc, url, cv, p: _started_reg("dc_attempt_1"),
            poll_fn=_sync_poll(["expired"], None),
        )
        self.assertEqual(len(self.cockpit.failures), 1)
        self.assertEqual(self.cockpit.failures[0][0], "REGISTRATION_NOT_COMPLETED")
        self.assertEqual(self.cockpit.successes, 0)
        self.assertEqual(self.store.saves, [])

    def test_retry_after_expired_saves_key_once(self) -> None:
        # First attempt: expires
        _do_flow(
            self.startup, self.cockpit, self.store, self.BACKEND,
            start_fn=lambda sc, url, cv, p: _started_reg("dc_attempt_1"),
            poll_fn=_sync_poll(["expired"], None),
        )
        # Retry: approved
        _do_flow(
            self.startup, self.cockpit, self.store, self.BACKEND,
            start_fn=lambda sc, url, cv, p: _started_reg("dc_attempt_2"),
            poll_fn=_sync_poll(["pending", "approved"], self.RETRY_KEY, self.store),
        )
        # Key saved exactly once total
        self.assertEqual(self.store.saves, [self.RETRY_KEY])
        # Success shown once
        self.assertEqual(self.cockpit.successes, 1)
        # Two registration cards (one per attempt)
        self.assertEqual(len(self.cockpit.registration_cards), 2)

    def test_retry_new_card_has_new_device_code(self) -> None:
        _do_flow(
            self.startup, self.cockpit, self.store, self.BACKEND,
            start_fn=lambda sc, url, cv, p: _started_reg("dc_expired_code"),
            poll_fn=_sync_poll([], None),
        )
        _do_flow(
            self.startup, self.cockpit, self.store, self.BACKEND,
            start_fn=lambda sc, url, cv, p: _started_reg("dc_new_retry_code"),
            poll_fn=_sync_poll([], self.RETRY_KEY, self.store),
        )
        self.assertEqual(self.cockpit.registration_cards[1].device_code, "dc_new_retry_code")


# ── Check 4: Offline behavior ─────────────────────────────────────────────────


class TestOfflineBehavior(unittest.TestCase):
    """Check 4: existing key + network failure → OFFLINE → no registration, key retained."""

    EXISTING_KEY = "atl_existing_offline_key"

    def test_offline_state_from_network_error_response(self) -> None:
        store = FakeCredentialStore(initial_key=self.EXISTING_KEY)
        startup = run_startup_device_check(
            validate_device_key_fn=lambda k: {"ok": False, "code": "NETWORK_ERROR"},
            load_device_key_fn=store.load,
            clear_device_key_fn=store.clear,
        )
        self.assertEqual(startup.result.state, DeviceState.OFFLINE)
        self.assertFalse(startup.should_start_registration)

    def test_offline_state_from_validator_raise(self) -> None:
        def raising_validator(key: str) -> dict:
            raise OSError("Connection refused")

        store = FakeCredentialStore(initial_key=self.EXISTING_KEY)
        startup = run_startup_device_check(
            validate_device_key_fn=raising_validator,
            load_device_key_fn=store.load,
            clear_device_key_fn=store.clear,
        )
        self.assertEqual(startup.result.state, DeviceState.OFFLINE)
        self.assertFalse(startup.should_start_registration)

    def test_key_not_cleared_when_offline(self) -> None:
        store = FakeCredentialStore(initial_key=self.EXISTING_KEY)
        run_startup_device_check(
            validate_device_key_fn=lambda k: {"ok": False, "code": "NETWORK_ERROR"},
            load_device_key_fn=store.load,
            clear_device_key_fn=store.clear,
        )
        self.assertEqual(store.clears, 0)
        self.assertEqual(store.load(), self.EXISTING_KEY)

    def test_offline_planner_uses_stored_key(self) -> None:
        """Even when OFFLINE at startup, planner still uses whatever key is stored."""
        from planner import planner as planner_mod

        captured: list[dict] = []

        def fake_urlopen(req, timeout=None):
            captured.append(json.loads(req.data.decode()))
            resp = mock.MagicMock()
            resp.read.return_value = json.dumps({"ok": True, "response": "ok"}).encode()
            resp.__enter__ = lambda s: s
            resp.__exit__ = mock.MagicMock(return_value=False)
            return resp

        with mock.patch.multiple(settings, BACKEND_URL="http://x", DEVICE_KEY=""):
            with mock.patch("planner.planner.load_device_key", return_value=self.EXISTING_KEY):
                with mock.patch("urllib.request.urlopen", fake_urlopen):
                    result = planner_mod.plan("offline query")

        self.assertTrue(result.get("ok"))
        self.assertEqual(captured[0]["device_key"], self.EXISTING_KEY)


# ── Check 5: No secret leakage ────────────────────────────────────────────────


class TestNoSecretLeakage(unittest.TestCase):
    """Check 5: device_code, device_key, registration_url must never appear in output."""

    DEVICE_CODE = "dc_SECRET_5L_MUST_NOT_APPEAR"
    DEVICE_KEY = "atl_SECRET_5L_MUST_NOT_APPEAR"
    REG_URL = "https://app.aigency.com/r?code=dc_SECRET_5L_MUST_NOT_APPEAR"
    BACKEND = "http://localhost:3000"

    def _run_full_flow(self) -> None:
        store = FakeCredentialStore()
        cockpit = FakeCockpit()
        startup = run_startup_device_check(
            validate_device_key_fn=lambda k: {"ok": True},
            load_device_key_fn=store.load,
            clear_device_key_fn=store.clear,
        )

        def fake_start_fn(sc, url, cv, p):
            return StartupRegistrationResult(
                attempted=True, started=True,
                device_code=self.DEVICE_CODE,
                registration_url=self.REG_URL,
                expires_at="2026-01-01T00:00:00Z",
                poll_interval_secs=5,
            )

        _do_flow(
            startup, cockpit, store, self.BACKEND,
            start_fn=fake_start_fn,
            poll_fn=_sync_poll(["pending", "approved"], self.DEVICE_KEY, store),
        )

    def test_no_device_code_in_stdout_stderr(self) -> None:
        out, err = io.StringIO(), io.StringIO()
        with mock.patch("sys.stdout", out), mock.patch("sys.stderr", err):
            self._run_full_flow()
        combined = out.getvalue() + err.getvalue()
        self.assertNotIn(self.DEVICE_CODE, combined)

    def test_no_device_key_in_stdout_stderr(self) -> None:
        out, err = io.StringIO(), io.StringIO()
        with mock.patch("sys.stdout", out), mock.patch("sys.stderr", err):
            self._run_full_flow()
        combined = out.getvalue() + err.getvalue()
        self.assertNotIn(self.DEVICE_KEY, combined)

    def test_no_secrets_in_log_output(self) -> None:
        captured: list[str] = []

        class _Cap(logging.Handler):
            def emit(self, record: logging.LogRecord) -> None:
                captured.append(self.format(record))

        handler = _Cap()
        root = logging.getLogger()
        root.addHandler(handler)
        try:
            self._run_full_flow()
        finally:
            root.removeHandler(handler)

        combined = " ".join(captured)
        self.assertNotIn(self.DEVICE_CODE, combined)
        self.assertNotIn(self.DEVICE_KEY, combined)
        self.assertNotIn(self.REG_URL, combined)


# ── Check 6: No duplicate polling ─────────────────────────────────────────────


class TestNoDuplicatePolling(unittest.TestCase):
    """Check 6: _retry_in_progress guard prevents concurrent retry threads."""

    def _ready_cockpit(self) -> CockpitWindow:
        cw = CockpitWindow()
        cw._win = mock.MagicMock()
        cw._ready = True
        return cw

    def test_second_retry_rejected_while_first_in_progress(self) -> None:
        cw = self._ready_cockpit()
        hold = threading.Event()

        cw.set_registration_retry_callback(lambda: hold.wait(timeout=3))

        r1 = cw._api.retry_registration()
        # Flag is set before thread.start() — second call always sees it
        r2 = cw._api.retry_registration()

        hold.set()
        time.sleep(0.05)

        self.assertTrue(r1.get("ok"))
        self.assertFalse(r2.get("ok"))
        self.assertIn("progress", r2.get("error", ""))

    def test_retry_available_again_after_first_completes(self) -> None:
        cw = self._ready_cockpit()
        done = threading.Event()
        call_count = [0]

        def cb():
            call_count[0] += 1
            done.set()

        cw.set_registration_retry_callback(cb)

        r1 = cw._api.retry_registration()
        done.wait(timeout=2)         # wait for first to finish

        done.clear()
        r2 = cw._api.retry_registration()
        done.wait(timeout=2)         # wait for second to finish

        self.assertTrue(r1.get("ok"))
        self.assertTrue(r2.get("ok"))
        self.assertEqual(call_count[0], 2)

    def test_flag_reset_to_false_after_completion(self) -> None:
        cw = self._ready_cockpit()
        done = threading.Event()

        def cb():
            done.set()

        cw.set_registration_retry_callback(cb)
        cw._api.retry_registration()
        done.wait(timeout=2)
        time.sleep(0.02)
        self.assertFalse(cw._retry_in_progress)

    def test_flag_false_when_no_callback(self) -> None:
        cw = self._ready_cockpit()
        cw._api.retry_registration()  # no callback
        self.assertFalse(cw._retry_in_progress)


# ── Check 7: Callback / thread safety ────────────────────────────────────────


class TestCallbackAndThreadSafety(unittest.TestCase):
    """Check 7: cockpit defers correctly; no raises when not ready or win is None."""

    def test_card_deferred_when_not_ready(self) -> None:
        cw = CockpitWindow()
        cw._win = mock.MagicMock()
        cw._ready = False
        reg = _started_reg("dc_defer")
        cw.show_registration_card(reg)
        cw._win.evaluate_js.assert_not_called()
        self.assertIs(cw._pending_reg, reg)

    def test_deferred_card_emitted_on_loaded(self) -> None:
        cw = CockpitWindow()
        cw._win = mock.MagicMock()
        cw._ready = False
        cw.show_registration_card(_started_reg("dc_loaded"))
        cw._on_loaded()
        self.assertTrue(cw._win.evaluate_js.called)

    def test_show_failed_no_raise_when_not_ready(self) -> None:
        cw = CockpitWindow()
        cw._win = mock.MagicMock()
        cw._ready = False
        cw.show_registration_failed("CODE", "message")
        cw._win.evaluate_js.assert_not_called()

    def test_show_success_no_raise_when_not_ready(self) -> None:
        cw = CockpitWindow()
        cw._win = mock.MagicMock()
        cw._ready = False
        cw.show_registration_success()
        cw._win.evaluate_js.assert_not_called()

    def test_show_status_deferred_when_not_ready(self) -> None:
        cw = CockpitWindow()
        cw._win = mock.MagicMock()
        cw._ready = False
        cw.show_registration_status("pending")
        cw._win.evaluate_js.assert_not_called()
        self.assertEqual(cw._pending_reg_status, "pending")

    def test_deferred_status_emitted_on_loaded(self) -> None:
        cw = CockpitWindow()
        cw._win = mock.MagicMock()
        cw._ready = False
        cw.show_registration_status("approved")
        cw._on_loaded()
        self.assertTrue(cw._win.evaluate_js.called)

    def test_all_registration_methods_no_raise_when_win_none(self) -> None:
        cw = CockpitWindow()
        # _win is None, _ready is False
        cw.show_registration_card(_started_reg())
        cw.show_registration_status("pending")
        cw.show_registration_success()
        cw.show_registration_failed("ERR", "msg")
        cw.hide_registration_card()
        # None of the above should raise


# ── Check 8: Planner no side effects ─────────────────────────────────────────


class TestPlannerNoSideEffects(unittest.TestCase):
    """Check 8: planner loads key and sends request; never save/clear/start-registration."""

    def setUp(self) -> None:
        from planner import planner as planner_mod
        self.planner = planner_mod

    def _run_plan(self, stored_key: str = "atl_planner_test") -> None:
        with mock.patch.multiple(settings, BACKEND_URL="http://localhost:3000", DEVICE_KEY=""):
            with mock.patch("planner.planner.load_device_key", return_value=stored_key):
                with mock.patch("urllib.request.urlopen", _make_ok_urlopen()):
                    self.planner.plan("test prompt")

    def test_planner_does_not_call_save_device_key(self) -> None:
        with mock.patch("device_credentials.save_device_key") as m:
            self._run_plan()
        m.assert_not_called()

    def test_planner_does_not_call_clear_device_key(self) -> None:
        with mock.patch("device_credentials.clear_device_key") as m:
            self._run_plan()
        m.assert_not_called()

    def test_planner_stored_key_wins_over_settings_key(self) -> None:
        captured: list[dict] = []

        def fake_urlopen(req, timeout=None):
            captured.append(json.loads(req.data.decode()))
            resp = mock.MagicMock()
            resp.read.return_value = json.dumps({"ok": True, "response": "ok"}).encode()
            resp.__enter__ = lambda s: s
            resp.__exit__ = mock.MagicMock(return_value=False)
            return resp

        STORED = "atl_stored_wins"
        SETTING = "atl_settings_fallback"
        with mock.patch.multiple(settings, BACKEND_URL="http://x", DEVICE_KEY=SETTING):
            with mock.patch("planner.planner.load_device_key", return_value=STORED):
                with mock.patch("urllib.request.urlopen", fake_urlopen):
                    self.planner.plan("test")

        self.assertEqual(captured[0]["device_key"], STORED)
        self.assertNotEqual(captured[0]["device_key"], SETTING)

    def test_planner_falls_back_to_settings_key(self) -> None:
        captured: list[dict] = []

        def fake_urlopen(req, timeout=None):
            captured.append(json.loads(req.data.decode()))
            resp = mock.MagicMock()
            resp.read.return_value = json.dumps({"ok": True, "response": "ok"}).encode()
            resp.__enter__ = lambda s: s
            resp.__exit__ = mock.MagicMock(return_value=False)
            return resp

        SETTING = "atl_settings_only"
        with mock.patch.multiple(settings, BACKEND_URL="http://x", DEVICE_KEY=SETTING):
            with mock.patch("planner.planner.load_device_key", return_value=None):
                with mock.patch("urllib.request.urlopen", fake_urlopen):
                    self.planner.plan("test")

        self.assertEqual(captured[0]["device_key"], SETTING)

    def test_planner_returns_error_when_no_key(self) -> None:
        with mock.patch.multiple(settings, BACKEND_URL="http://x", DEVICE_KEY=""):
            with mock.patch("planner.planner.load_device_key", return_value=None):
                result = self.planner.plan("test")
        self.assertFalse(result.get("ok"))
        self.assertEqual(result["error"]["code"], "INTERNAL_ERROR")


if __name__ == "__main__":
    unittest.main()
