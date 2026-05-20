import os
from datetime import date
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


def test_get_ramais_returns_only_valid_extensions() -> None:
    service = SheetService(EXAMPLES_DIR)

    ramais = service.get_ramais()

    assert {"nome": "ALBERTO LIMA", "setor": "BIOLOGIA MOLECULAR", "ramal": ""} not in ramais
    assert ramais == sorted(ramais, key=lambda item: item["nome"].casefold())
    assert all(item["ramal"] for item in ramais)


def test_get_aniversariantes_filters_current_month() -> None:
    service = SheetService(EXAMPLES_DIR)

    aniversariantes = service.get_aniversariantes(date(2026, 8, 1))

    assert all(item["dia"].isdigit() for item in aniversariantes)
    assert all(1 <= int(item["dia"]) <= 31 for item in aniversariantes)
    assert [item["dia"] for item in aniversariantes] == sorted(item["dia"] for item in aniversariantes)


def test_missing_required_columns_raise_sheet_error(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    sheet_path = tmp_path / "folgas.xlsx"
    sheet_path.touch()
    service = SheetService(tmp_path)

    monkeypatch.setattr("srv_intranet_api.services.sheets.pl.read_excel", lambda _: pl.DataFrame({"Funcionário": []}))

    with pytest.raises(SheetError, match="Missing columns"):
        service.get_folgas()


def test_missing_required_csv_columns_raise_sheet_error(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    csv_path = tmp_path / "colaboradores.csv"
    csv_path.touch()
    service = SheetService(tmp_path)

    monkeypatch.setattr("srv_intranet_api.services.sheets.pl.read_csv", lambda _: pl.DataFrame({"NOME": []}))

    with pytest.raises(SheetError, match="Missing columns"):
        service.get_ramais()


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


def test_csv_cache_reloads_when_mtime_changes(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    csv_path = tmp_path / "colaboradores.csv"
    csv_path.touch()
    service = SheetService(tmp_path)
    reads = 0

    def read_csv(_: Path) -> pl.DataFrame:
        nonlocal reads
        reads += 1
        return pl.DataFrame(
            {
                "NOME": ["ADRIANA LÍDIA COSTA NOVO"],
                "RAMAL": ["6137"],
                "SETOR": ["ENFERMAGEM"],
                "DATA_NASCIMENTO": ["1978-08-06 00:00:00.000"],
            }
        )

    monkeypatch.setattr("srv_intranet_api.services.sheets.pl.read_csv", read_csv)

    service.get_ramais()
    service.get_ramais()
    assert reads == 1

    stat = csv_path.stat()
    os.utime(csv_path, ns=(stat.st_atime_ns, stat.st_mtime_ns + 1_000_000_000))
    service.get_ramais()

    assert reads == 2
