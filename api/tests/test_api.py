from pathlib import Path

from fastapi.testclient import TestClient

from srv_intranet_api.main import app
from srv_intranet_api.routers.sheets import get_cached_sheet_service
from srv_intranet_api.settings import get_settings

EXAMPLES_DIR = Path(__file__).resolve().parents[1] / "data" / "examples"


def configure_examples_dir() -> None:
    get_settings.cache_clear()
    get_cached_sheet_service.cache_clear()
    settings = get_settings()
    settings.sheets_dir = EXAMPLES_DIR


def test_health() -> None:
    client = TestClient(app)

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_sheet_endpoints_return_arrays() -> None:
    configure_examples_dir()
    client = TestClient(app)

    for path in ["/api/escalas", "/api/ferias", "/api/folgas", "/api/eventos"]:
        response = client.get(path)
        assert response.status_code == 200
        assert isinstance(response.json(), list)


def test_missing_sheet_returns_500(tmp_path: Path) -> None:
    get_settings.cache_clear()
    get_cached_sheet_service.cache_clear()
    settings = get_settings()
    settings.sheets_dir = tmp_path
    client = TestClient(app)

    response = client.get("/api/folgas")

    assert response.status_code == 500
    assert "Sheet file not found" in response.json()["detail"]
