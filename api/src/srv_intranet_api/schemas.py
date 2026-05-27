from pydantic import BaseModel, ConfigDict, Field


class HealthResponse(BaseModel):
    model_config = ConfigDict(json_schema_extra={"examples": [{"status": "ok"}]})

    status: str = Field(description="API health status.", examples=["ok"])


class EscalaEvent(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "title": "COLABORADOR A, COLABORADOR B",
                    "start": "2026-03-01",
                    "allDay": True,
                    "tipo": "Diurno",
                }
            ]
        }
    )

    title: str = Field(description="Names shown in the FullCalendar event.", examples=["COLABORADOR A, COLABORADOR B"])
    start: str = Field(description="Event date in ISO format.", examples=["2026-03-01"])
    allDay: bool = Field(description="Whether this is an all-day calendar event.", examples=[True])
    tipo: str = Field(description="Shift type used by frontend filters.", examples=["Diurno"])


class FeriasItem(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={"examples": [{"nome": "COLABORADOR EXEMPLO", "periodo": "16/02/2026 a 02/03/2026"}]}
    )

    nome: str = Field(description="Employee name.", examples=["COLABORADOR EXEMPLO"])
    periodo: str = Field(description="Vacation period formatted for display.", examples=["16/02/2026 a 02/03/2026"])


class FolgaItem(BaseModel):
    model_config = ConfigDict(json_schema_extra={"examples": [{"nome": "COLABORADOR EXEMPLO", "detalhes": "21, 29"}]})

    nome: str = Field(description="Employee name.", examples=["COLABORADOR EXEMPLO"])
    detalhes: str = Field(description="Days off formatted for display.", examples=["21, 29"])


class EventoItem(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "data": "19 a 24/05/26",
                    "titulo": "Evento Institucional Exemplo",
                    "local": "São Paulo, Brasil",
                    "link": "https://example.org/evento",
                    "link_submissao": "https://example.org/submissao",
                }
            ]
        }
    )

    data: str = Field(description="Event date or date range formatted for display.", examples=["19 a 24/05/26"])
    titulo: str = Field(description="Event title.", examples=["Evento Institucional Exemplo"])
    local: str = Field(description="Event location.", examples=["São Paulo, Brasil"])
    link: str = Field(description="External event URL.", examples=["https://example.org/evento"])
    link_submissao: str = Field(
        default="",
        description="Optional external submission URL for the event.",
        examples=["https://example.org/submissao"],
    )


class RamalItem(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "nome": "COLABORADOR EXEMPLO",
                    "setor": "SETOR EXEMPLO",
                    "ramal": "6000",
                }
            ]
        }
    )

    nome: str = Field(description="Employee or sector name.", examples=["COLABORADOR EXEMPLO"])
    setor: str = Field(description="Employee sector.", examples=["SETOR EXEMPLO"])
    ramal: str = Field(description="Phone extension.", examples=["6000"])


class AniversarianteItem(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "dia": "06",
                    "nome": "COLABORADOR EXEMPLO",
                    "setor": "SETOR EXEMPLO",
                }
            ]
        }
    )

    dia: str = Field(description="Birthday day in the current month.", examples=["06"])
    nome: str = Field(description="Employee name.", examples=["COLABORADOR EXEMPLO"])
    setor: str = Field(description="Employee sector.", examples=["SETOR EXEMPLO"])


class ApiError(BaseModel):
    model_config = ConfigDict(json_schema_extra={"examples": [{"detail": "Sheet file not found: /path/to/file.xlsx"}]})

    detail: str = Field(description="Error detail.")
