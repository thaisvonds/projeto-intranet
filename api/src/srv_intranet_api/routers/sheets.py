from functools import lru_cache
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from srv_intranet_api.schemas import ApiError, EscalaEvent, EventoItem, FeriasItem, FolgaItem
from srv_intranet_api.services.sheets import SheetError, SheetService
from srv_intranet_api.settings import Settings, get_settings

SHEET_ERROR_RESPONSES = {
    500: {
        "model": ApiError,
        "description": "Spreadsheet file is missing, unreadable, or does not match the expected template columns.",
    }
}

router = APIRouter(prefix="/api", tags=["sheets"], responses=SHEET_ERROR_RESPONSES)


@lru_cache
def get_cached_sheet_service(sheets_dir: str) -> SheetService:
    return SheetService(Path(sheets_dir))


def get_sheet_service(settings: Settings = Depends(get_settings)) -> SheetService:
    return get_cached_sheet_service(str(settings.sheets_dir))


def _handle_sheet_call(callback: Any) -> Any:
    try:
        return callback()
    except SheetError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get(
    "/escalas",
    response_model=list[EscalaEvent],
    summary="List shift calendar events",
    description=(
        "Reads `escalas.xlsx` and returns FullCalendar-compatible all-day events grouped by shift type. "
        "The `tipo` field is used by frontend filters."
    ),
)
def get_escalas(service: SheetService = Depends(get_sheet_service)) -> list[dict[str, Any]]:
    return _handle_sheet_call(service.get_escalas)


@router.get(
    "/ferias",
    response_model=list[FeriasItem],
    summary="List vacation periods",
    description="Reads `ferias.xlsx` and returns employee vacation periods formatted for display.",
)
def get_ferias(service: SheetService = Depends(get_sheet_service)) -> list[dict[str, str]]:
    return _handle_sheet_call(service.get_ferias)


@router.get(
    "/folgas",
    response_model=list[FolgaItem],
    summary="List monthly days off",
    description="Reads `folgas.xlsx` and returns employee days off formatted for the intranet side list.",
)
def get_folgas(service: SheetService = Depends(get_sheet_service)) -> list[dict[str, str]]:
    return _handle_sheet_call(service.get_folgas)


@router.get(
    "/eventos",
    response_model=list[EventoItem],
    summary="List institutional events",
    description="Reads `eventos.xlsx` and returns event card data for the intranet right panel.",
)
def get_eventos(service: SheetService = Depends(get_sheet_service)) -> list[dict[str, str]]:
    return _handle_sheet_call(service.get_eventos)
