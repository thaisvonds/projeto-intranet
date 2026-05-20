from pydantic import BaseModel, ConfigDict, Field


class HealthResponse(BaseModel):
    model_config = ConfigDict(json_schema_extra={"examples": [{"status": "ok"}]})

    status: str = Field(description="API health status.", examples=["ok"])


class EscalaEvent(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "title": "JULIA, KAMILA",
                    "start": "2026-03-01",
                    "allDay": True,
                    "tipo": "Diurno",
                }
            ]
        }
    )

    title: str = Field(description="Names shown in the FullCalendar event.", examples=["JULIA, KAMILA"])
    start: str = Field(description="Event date in ISO format.", examples=["2026-03-01"])
    allDay: bool = Field(description="Whether this is an all-day calendar event.", examples=[True])
    tipo: str = Field(description="Shift type used by frontend filters.", examples=["Diurno"])


class FeriasItem(BaseModel):
    model_config = ConfigDict(json_schema_extra={"examples": [{"nome": "Sandra", "periodo": "16/02/2026 a 02/03/2026"}]})

    nome: str = Field(description="Employee name.", examples=["Sandra"])
    periodo: str = Field(description="Vacation period formatted for display.", examples=["16/02/2026 a 02/03/2026"])


class FolgaItem(BaseModel):
    model_config = ConfigDict(json_schema_extra={"examples": [{"nome": "Kamila", "detalhes": "21, 29"}]})

    nome: str = Field(description="Employee name.", examples=["Kamila"])
    detalhes: str = Field(description="Days off formatted for display.", examples=["21, 29"])


class EventoItem(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "data": "19 a 24/05/26",
                    "titulo": "19º Workshop Internacional de Histocompatibilidade",
                    "local": "Numazu, Japão",
                    "link": "https://ihiw19.org/",
                }
            ]
        }
    )

    data: str = Field(description="Event date or date range formatted for display.", examples=["19 a 24/05/26"])
    titulo: str = Field(description="Event title.", examples=["19º Workshop Internacional de Histocompatibilidade"])
    local: str = Field(description="Event location.", examples=["Numazu, Japão"])
    link: str = Field(description="External event URL.", examples=["https://ihiw19.org/"])


class ApiError(BaseModel):
    model_config = ConfigDict(json_schema_extra={"examples": [{"detail": "Sheet file not found: /path/to/folgas.xlsx"}]})

    detail: str = Field(description="Error detail.")
