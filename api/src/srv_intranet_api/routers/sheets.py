from functools import lru_cache
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from srv_intranet_api.services.sheets import SheetError, SheetService
from srv_intranet_api.settings import Settings, get_settings

router = APIRouter(prefix="/api", tags=["sheets"])


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


@router.get("/escalas")
def get_escalas(service: SheetService = Depends(get_sheet_service)) -> list[dict[str, Any]]:
    return _handle_sheet_call(service.get_escalas)


@router.get("/ferias")
def get_ferias(service: SheetService = Depends(get_sheet_service)) -> list[dict[str, str]]:
    return _handle_sheet_call(service.get_ferias)


@router.get("/folgas")
def get_folgas(service: SheetService = Depends(get_sheet_service)) -> list[dict[str, str]]:
    return _handle_sheet_call(service.get_folgas)


@router.get("/eventos")
def get_eventos(service: SheetService = Depends(get_sheet_service)) -> list[dict[str, str]]:
    return _handle_sheet_call(service.get_eventos)
