"""Atlas watchdog — launches atlas.py and restarts it on crash.

Run this process instead of atlas.py directly in production.
Phase 0: basic restart loop with crash limit. No crash reporting yet (Phase 6).
"""

import subprocess
import sys
import time
from pathlib import Path

MAX_RESTARTS = 3
WINDOW_SECONDS = 60
RESTART_DELAY = 3


def main() -> None:
    base = Path(__file__).resolve().parent
    entry = str(base / "atlas.py")
    python = sys.executable

    restarts: list[float] = []

    print(f"[watchdog] starting Atlas: {entry}")

    while True:
        proc = subprocess.Popen([python, entry])
        proc.wait()
        exit_code = proc.returncode
        now = time.time()

        print(f"[watchdog] Atlas exited (code={exit_code})")

        restarts = [t for t in restarts if now - t < WINDOW_SECONDS]
        restarts.append(now)

        if len(restarts) > MAX_RESTARTS:
            print(
                f"[watchdog] {MAX_RESTARTS} reinicios en {WINDOW_SECONDS}s — "
                "deteniendo. Revisa atlas.log."
            )
            sys.exit(1)

        print(f"[watchdog] reiniciando en {RESTART_DELAY}s "
              f"(intento {len(restarts)}/{MAX_RESTARTS})...")
        time.sleep(RESTART_DELAY)


if __name__ == "__main__":
    main()
