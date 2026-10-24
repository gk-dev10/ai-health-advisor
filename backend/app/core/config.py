import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


BACKEND_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_ROOT / ".env", override=False)


def _csv_env(name: str, default: str) -> tuple[str, ...]:
    return tuple(value.strip() for value in os.getenv(name, default).split(",") if value.strip())


def _path_env(name: str, default: Path) -> Path:
    value = os.getenv(name)
    if not value:
        return default
    path = Path(value).expanduser()
    return path if path.is_absolute() else BACKEND_ROOT / path


@dataclass(frozen=True)
class Settings:
    gemini_api_key: str
    gemini_model: str
    allowed_origins: tuple[str, ...]
    triage_db_path: Path

    @property
    def ai_configured(self) -> bool:
        return bool(self.gemini_api_key)


settings = Settings(
    gemini_api_key=(os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or "").strip(),
    gemini_model=os.getenv("GEMINI_MODEL", "gemini-3.6-flash").strip(),
    allowed_origins=_csv_env("FRONTEND_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"),
    triage_db_path=_path_env("TRIAGE_DB_PATH", BACKEND_ROOT / "data" / "intakes.sqlite3"),
)
