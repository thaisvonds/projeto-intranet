from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from srv_intranet_api.routers.sheets import router as sheets_router
from srv_intranet_api.settings import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Intranet IGEN API", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(sheets_router)
    return app


app = create_app()
