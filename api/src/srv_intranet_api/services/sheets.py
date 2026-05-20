from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path
from typing import Any

import polars as pl


class SheetError(RuntimeError):
    pass


@dataclass(frozen=True)
class CachedSheet:
    mtime_ns: int
    dataframe: pl.DataFrame


class SheetService:
    ESCALAS_FILE = "escalas.xlsx"
    FERIAS_FILE = "ferias.xlsx"
    FOLGAS_FILE = "folgas.xlsx"
    EVENTOS_FILE = "eventos.xlsx"

    ESCALAS_COLUMNS = [
        "Data",
        "Diurno (Nomes separados por vírgula)",
        "Noturno (Nomes separados por vírgula)",
        "TI (Nomes)",
    ]
    FERIAS_COLUMNS = ["Funcionário", "Início das Férias", "Término das Férias"]
    FOLGAS_COLUMNS = ["Funcionário", "Dias de Folga (Ex: 01, 05, 10)"]
    EVENTOS_COLUMNS = ["Data", "Titulo", "Local", "Link"]

    def __init__(self, sheets_dir: Path) -> None:
        self.sheets_dir = Path(sheets_dir)
        self._cache: dict[Path, CachedSheet] = {}

    def get_escalas(self) -> list[dict[str, Any]]:
        df = self._read_sheet(self.ESCALAS_FILE, self.ESCALAS_COLUMNS)
        events: list[dict[str, Any]] = []
        shifts = [
            ("Diurno", "Diurno (Nomes separados por vírgula)"),
            ("Noturno", "Noturno (Nomes separados por vírgula)"),
            ("TI", "TI (Nomes)"),
        ]

        for row in df.iter_rows(named=True):
            start = _format_iso_date(row["Data"])
            if not start:
                continue

            for shift_name, column_name in shifts:
                names = _clean_text(row[column_name])
                if not names:
                    continue

                events.append(
                    {
                        "title": names,
                        "start": start,
                        "allDay": True,
                        "tipo": shift_name,
                    }
                )

        return events

    def get_ferias(self) -> list[dict[str, str]]:
        df = self._read_sheet(self.FERIAS_FILE, self.FERIAS_COLUMNS)
        ferias: list[dict[str, str]] = []

        for row in df.iter_rows(named=True):
            nome = _clean_text(row["Funcionário"])
            if not nome:
                continue

            inicio = _format_br_date(row["Início das Férias"])
            termino = _format_br_date(row["Término das Férias"])
            periodo = " a ".join(part for part in [inicio, termino] if part)
            ferias.append({"nome": nome, "periodo": periodo})

        return ferias

    def get_folgas(self) -> list[dict[str, str]]:
        df = self._read_sheet(self.FOLGAS_FILE, self.FOLGAS_COLUMNS)
        folgas: list[dict[str, str]] = []

        for row in df.iter_rows(named=True):
            nome = _clean_text(row["Funcionário"])
            detalhes = _clean_text(row["Dias de Folga (Ex: 01, 05, 10)"])
            if nome:
                folgas.append({"nome": nome, "detalhes": detalhes})

        return folgas

    def get_eventos(self) -> list[dict[str, str]]:
        df = self._read_sheet(self.EVENTOS_FILE, self.EVENTOS_COLUMNS)
        eventos: list[dict[str, str]] = []

        for row in df.iter_rows(named=True):
            titulo = _clean_text(row["Titulo"])
            if not titulo:
                continue

            eventos.append(
                {
                    "data": _clean_text(row["Data"]),
                    "titulo": titulo,
                    "local": _clean_text(row["Local"]),
                    "link": _clean_text(row["Link"]),
                }
            )

        return eventos

    def _read_sheet(self, filename: str, required_columns: list[str]) -> pl.DataFrame:
        path = self.sheets_dir / filename
        if not path.exists():
            raise SheetError(f"Sheet file not found: {path}")

        try:
            mtime_ns = path.stat().st_mtime_ns
        except OSError as exc:
            raise SheetError(f"Cannot stat sheet file: {path}") from exc

        cached = self._cache.get(path)
        if cached and cached.mtime_ns == mtime_ns:
            df = cached.dataframe
        else:
            try:
                df = pl.read_excel(path)
            except Exception as exc:
                raise SheetError(f"Cannot read sheet file: {path}") from exc
            self._cache[path] = CachedSheet(mtime_ns=mtime_ns, dataframe=df)

        missing_columns = [column for column in required_columns if column not in df.columns]
        if missing_columns:
            raise SheetError(f"Missing columns in {filename}: {', '.join(missing_columns)}")

        return df


def _clean_text(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _format_iso_date(value: Any) -> str:
    if isinstance(value, datetime):
        return value.date().isoformat()
    if isinstance(value, date):
        return value.isoformat()
    return _clean_text(value)


def _format_br_date(value: Any) -> str:
    if isinstance(value, datetime):
        return value.strftime("%d/%m/%Y")
    if isinstance(value, date):
        return value.strftime("%d/%m/%Y")
    return _clean_text(value)
