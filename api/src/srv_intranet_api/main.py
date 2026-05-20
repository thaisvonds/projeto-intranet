from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from srv_intranet_api.routers.sheets import router as sheets_router
from srv_intranet_api.schemas import HealthResponse
from srv_intranet_api.settings import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Intranet IGEN API",
        summary="JSON API for intranet calendar, vacation, days off, and event data.",
        description=(
            "Reads Excel templates from a configurable folder and exposes normalized JSON for the IGEN intranet "
            "frontend. Spreadsheet data is cached by file modification time."
        ),
        version="0.1.0",
        contact={"name": "IGEN TI", "url": "https://www.igen.org.br/"},
        openapi_tags=[
            {
                "name": "health",
                "description": "Operational endpoints used to verify that the API is running.",
            },
            {
                "name": "sheets",
                "description": "Read-only endpoints generated from the Excel templates.",
            },
            {
                "name": "colaboradores",
                "description": "Read-only endpoints generated from the collaborators CSV file.",
            },
        ],
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET"],
        allow_headers=["*"],
    )

    @app.get(
        "/health",
        response_model=HealthResponse,
        tags=["health"],
        summary="Check API health",
        description="Returns a simple status payload when the API process is running.",
    )
    def health() -> HealthResponse:
        return {"status": "ok"}

    app.include_router(sheets_router)
    return app


app = create_app()
