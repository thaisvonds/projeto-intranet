import os
from pathlib import Path

import polars as pl
import pytest

from srv_intranet_api.services.sheets import SheetError, SheetService

EXAMPLES_DIR = Path(__file__).resolve().parents[1] / "data" / "examples"


def test_get_escalas_returns_fullcalendar_events() -> None:
    service = SheetService(EXAMPLES_DIR)

    events = service.get_escalas()

    assert events == [
        {
            "title": "JULIA, KAMILA",
            "start": "2026-03-01",
            "allDay": True,
            "tipo": "Diurno",
        },
        {
            "title": "CAMILLA C, DANIELLE, LUIZA, THAIS C",
            "start": "2026-03-01",
            "allDay": True,
            "tipo": "Noturno",
        },
        {
            "title": "GUILHERME",
            "start": "2026-03-01",
            "allDay": True,
            "tipo": "TI",
        },
    ]


def test_get_ferias_formats_periods() -> None:
    service = SheetService(EXAMPLES_DIR)

    assert service.get_ferias() == [{"nome": "Sandra", "periodo": "16/02/2026 a 02/03/2026"}]


def test_get_folgas_returns_display_details() -> None:
    service = SheetService(EXAMPLES_DIR)

    assert service.get_folgas() == [{"nome": "Kamila", "detalhes": "21, 29"}]


def test_get_eventos_returns_card_data() -> None:
    service = SheetService(EXAMPLES_DIR)

    eventos = service.get_eventos()

    assert eventos[0] == {
        "data": "19 a 24/05/26",
        "titulo": "19º Workshop Internacional de Histocompatibilidade",
        "local": "Numazu, Japão",
        "link": "https://ihiw19.org/",
    }


def test_missing_required_columns_raise_sheet_error(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    sheet_path = tmp_path / "folgas.xlsx"
    sheet_path.touch()
    service = SheetService(tmp_path)

    monkeypatch.setattr("srv_intranet_api.services.sheets.pl.read_excel", lambda _: pl.DataFrame({"Funcionário": []}))

    with pytest.raises(SheetError, match="Missing columns"):
        service.get_folgas()


def test_sheet_cache_reloads_when_mtime_changes(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    sheet_path = tmp_path / "folgas.xlsx"
    sheet_path.touch()
    service = SheetService(tmp_path)
    reads = 0

    def read_excel(_: Path) -> pl.DataFrame:
        nonlocal reads
        reads += 1
        return pl.DataFrame(
            {
                "Funcionário": ["Kamila"],
                "Dias de Folga (Ex: 01, 05, 10)": ["21, 29"],
            }
        )

    monkeypatch.setattr("srv_intranet_api.services.sheets.pl.read_excel", read_excel)

    service.get_folgas()
    service.get_folgas()
    assert reads == 1

    stat = sheet_path.stat()
    os.utime(sheet_path, ns=(stat.st_atime_ns, stat.st_mtime_ns + 1_000_000_000))
    service.get_folgas()

    assert reads == 2
