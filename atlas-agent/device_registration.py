"""
Atlas Desktop — Device registration flow orchestrator.
"""
from __future__ import annotations

import secrets
import time
from typing import Callable, Optional

from device_client import AtlasDeviceClient, PollResult, StartResult


def generate_device_code() -> str:
    """Generate a cryptographically random device identifier."""
    return secrets.token_hex(16)


class DeviceRegistrationFlow:
    def __init__(
        self,
        client: AtlasDeviceClient,
        save_fn: Optional[Callable[[str], None]] = None,
        sleep_fn: Optional[Callable[[float], None]] = None,
    ) -> None:
        self._client = client
        self._save = save_fn if save_fn is not None else self._default_save
        self._sleep = sleep_fn if sleep_fn is not None else time.sleep

    @staticmethod
    def _default_save(key: str) -> None:
        from device_credentials import save_device_key
        save_device_key(key)

    def start(self, device_id: str) -> StartResult:
        return self._client.start_registration(device_id)

    def poll_once(self, device_code: str) -> PollResult:
        return self._client.poll_registration(device_code)

    def run_poll_loop(
        self,
        device_code: str,
        interval_seconds: float = 5.0,
        max_polls: int = 180,
        on_status: Optional[Callable[[str], None]] = None,
    ) -> Optional[str]:
        last_status: Optional[str] = None
        for _ in range(max_polls):
            result = self.poll_once(device_code)
            if not result.ok:
                if result.error.code == "NETWORK_ERROR":
                    self._sleep(interval_seconds)
                    continue
                return None
            current_status = result.status
            if on_status and current_status != last_status:
                on_status(current_status)
            last_status = current_status
            if current_status == "approved" and result.device_key:
                self._save(result.device_key)
                return result.device_key
            if current_status in ("expired", "denied", "completed"):
                return None
            self._sleep(interval_seconds)
        return None
