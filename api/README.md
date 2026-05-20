# Intranet IGEN API

Serviço em **FastAPI** responsável por ler os modelos de planilhas da intranet e expor os dados em JSON para o frontend estático.

## Executar localmente

A partir desta pasta `api/`:

```bash
PYTHONPATH=src poetry run uvicorn srv_intranet_api.main:app --reload --port 10638
```

A API ficará disponível em:

```text
http://localhost:10638
```

Verificação de saúde:

```text
GET /health
```

Documentação interativa:

```text
http://localhost:10638/docs
http://localhost:10638/redoc
```

## Configuração

As configurações são carregadas por variáveis de ambiente com o prefixo `INTRANET_API_`.

```bash
INTRANET_API_SHEETS_DIR=/path/to/modelos-tabelas
INTRANET_API_CORS_ORIGINS=http://localhost:8946,http://127.0.0.1:8946
```

Valores padrão:

```text
INTRANET_API_SHEETS_DIR=api/data/examples
INTRANET_API_CORS_ORIGINS=http://localhost:8946,http://127.0.0.1:8946
```

## Endpoints disponíveis

```text
GET /api/escalas
GET /api/ferias
GET /api/folgas
GET /api/eventos
```

O serviço lê a primeira aba de cada arquivo Excel. Arquivos ausentes, ilegíveis ou com colunas obrigatórias faltando retornam HTTP 500 para deixar problemas de template/configuração visíveis.

## Desenvolvimento

```bash
poetry run pytest
poetry run ruff check .
```
