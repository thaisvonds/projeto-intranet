# Portal Institucional - Intranet Igen (v2.0)

Este projeto representa a modernização completa da Intranet do **Instituto de Imunogenética (IGEN)**. O objetivo foi transformar um portal legado em uma plataforma ágil, responsiva e de fácil manutenção para as equipes de TI, RH e Comunicação, otimizando o fluxo de trabalho em um ambiente de laboratório genético.

## Evolução e Melhorias (Versão 2.0)

A nova interface foi projetada para eliminar processos manuais e centralizar informações críticas:

* **Central de Plantões Interativa:** Implementação do **FullCalendar** com filtros em tempo real para escalas **Diurno, Noturno e TI**. 
* **Filtro Inteligente:** Sistema de busca por nome do colaborador e filtros por categoria, integrados diretamente à visualização do calendário.
* **Exportação para PDF:** Motor de impressão customizado em JavaScript que permite salvar a escala com os filtros aplicados em layout profissional (modo paisagem).
* **Arquitetura Orientada a API:** O sistema foi refatorado para consumir múltiplos endpoints simultâneos utilizando `Promise.all`, garantindo que Escalas, Férias, Folgas, Eventos, Ramais e Aniversariantes sejam carregados de forma assíncrona e segura.
* **Gestão de Eventos Dinâmica:** Seção de congressos e workshops alimentada via API, com suporte a links externos e descrições automáticas.
* **Banner e Notícias:** Implementação de banner em vídeo otimizado (167KB) e carrossel de notícias dinâmico via `noticias.json`.

## Tecnologias Utilizadas

* **Frontend:** HTML5 semântico, CSS3 (Variáveis, Grid e Flexbox) e JavaScript Vanilla (ES6+).
* **Bibliotecas:** * [FullCalendar 6.1](https://fullcalendar.io/) para gestão de escalas.
    * [Font Awesome](https://fontawesome.com/) para iconografia.
* **Servidor de desenvolvimento:** [Vite](https://vite.dev/) com proxy local para a API.
* **Arquitetura de Dados:** Consumo de API em **FastAPI** para alimentar Escalas, Férias, Folgas e Eventos a partir de planilhas Excel, além de Ramais e Aniversariantes a partir de CSV.

## Estrutura de Manutenção (Low-Code)

Para permitir que equipes administrativas (RH/Secretaria) atualizem o portal sem tocar no código, o projeto inclui uma estrutura de suporte:

1.  **Pasta `api/data/examples`:** Contém planilhas Excel (`.xlsx`) e o arquivo `colaboradores.csv` que servem de exemplo para a alimentação da API.
2.  **Integração:** A API lê os modelos configurados e gera os JSONs consumidos pelo frontend.
3.  **Notícias:** Atualização simplificada via `js/noticias.json` para a equipe de TI local.

## 📁 Estrutura do Repositório

```text
PROJETO-INTRANET/
├── api/                # Serviço FastAPI que lê as planilhas e expõe JSON
└── web/                # Frontend estático servido pelo Vite
    ├── css/            # Estilização modular e regras de impressão (@media print)
    ├── js/             # Lógica mestre: filtros, busca, PDF e conexões de API
    ├── images/         # Ativos visuais e imagens do carrossel de notícias
    ├── pdfs/           # Repositório de documentos institucionais
    └── index.html      # Estrutura principal do portal
```

👩‍💻 Sobre a Desenvolvedora
Thaís Cavalcante - Desenvolvedora Full Stack Jr.

Atualmente cursando Análise e Desenvolvimento de Sistemas, com foco em soluções práticas para o setor de genética e saúde, aplicando princípios de Clean Code, SOLID e automação de processos.

## Execução local com Vite

Inicie primeiro a API na porta `10638`:

```bash
cd ../api
PYTHONPATH=src poetry run uvicorn srv_intranet_api.main:app --reload --port 10638
```

Depois inicie o frontend na porta `8946`:

```bash
pnpm run dev
```

O Vite redireciona `/api/*` para `http://127.0.0.1:10638`. Por isso, o frontend deve usar caminhos relativos, como `/api/escalas`.

## Build de produção

```bash
pnpm run build
```
