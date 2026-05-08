import os
import sys
from pathlib import Path

from dotenv import load_dotenv

if getattr(sys, "frozen", False):
    BASE_DIR = Path(sys.executable).resolve().parent
else:
    BASE_DIR = Path(__file__).resolve().parent.parent

env_path = BASE_DIR / ".env.local"
load_dotenv(env_path)

DEVICE_KEY: str = os.getenv("ATLAS_DEVICE_KEY", "")
BACKEND_URL: str = os.getenv("BACKEND_URL", "").rstrip("/")
ATLAS_USER_NAME: str = os.getenv("ATLAS_USER_NAME", "usuario")

REQUIRED = {"ATLAS_DEVICE_KEY": DEVICE_KEY, "BACKEND_URL": BACKEND_URL}


def validate() -> None:
    missing = [k for k, v in REQUIRED.items() if not v]
    if missing:
        raise RuntimeError(
            f"Variables faltantes en {env_path}: {', '.join(missing)}"
        )
