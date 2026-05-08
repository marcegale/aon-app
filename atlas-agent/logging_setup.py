import io
import logging
import sys
from logging.handlers import RotatingFileHandler
from pathlib import Path


def setup_logging(base_dir: Path) -> None:
    log_path = str(base_dir / "atlas.log")

    root = logging.getLogger()
    root.handlers.clear()

    handler = RotatingFileHandler(
        log_path, maxBytes=512_000, backupCount=2, encoding="utf-8"
    )
    handler.setFormatter(logging.Formatter("%(asctime)s %(message)s"))
    root.addHandler(handler)
    root.setLevel(logging.INFO)
    logging.raiseExceptions = False

    if getattr(sys, "frozen", False):
        class _LogWriter(io.TextIOBase):
            def write(self, s):
                if s.strip():
                    try:
                        with open(log_path, "a", encoding="utf-8", errors="replace") as f:
                            f.write(s)
                    except Exception:
                        pass
                return len(s)

            def flush(self):
                pass

        sys.stdout = _LogWriter()
        sys.stderr = _LogWriter()
