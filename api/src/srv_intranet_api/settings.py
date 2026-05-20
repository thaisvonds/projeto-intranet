from functools import lru_cache
from pathlib import Path
from typing import Annotated

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

DEFAULT_SHEETS_DIR = Path(__file__).resolve().parents[2] / "data" / "examples"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="INTRANET_API_", env_file=".env", extra="ignore")

    sheets_dir: Path = DEFAULT_SHEETS_DIR
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: [
            "http://localhost:8946",
            "http://127.0.0.1:8946",
        ]
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
