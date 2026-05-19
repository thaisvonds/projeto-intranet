# Portal Institucional - Intranet Igen (v2.0)

Este projeto representa a modernização completa da Intranet do **Instituto de Imunogenética (IGEN)**. O objetivo foi transformar um portal legado em uma plataforma ágil, responsiva e de fácil manutenção para as equipes de TI, RH e Comunicação, otimizando o fluxo de trabalho em um ambiente de laboratório genético.

## Evolução e Melhorias (Versão 2.0)

A nova interface foi projetada para eliminar processos manuais e centralizar informações críticas:

* **Central de Plantões Interativa:** Implementação do **FullCalendar** com filtros em tempo real para escalas **Diurno, Noturno e TI**. 
* **Filtro Inteligente:** Sistema de busca por nome do colaborador e filtros por categoria, integrados diretamente à visualização do calendário.
* **Exportação para PDF:** Motor de impressão customizado em JavaScript que permite salvar a escala com os filtros aplicados em layout profissional (modo paisagem).
* **Arquitetura Orientada a API:** O sistema foi refatorado para consumir múltiplos endpoints simultâneos utilizando `Promise.all`, garantindo que Escalas, Férias, Folgas e Eventos sejam carregados de forma assíncrona e segura.
* **Gestão de Eventos Dinâmica:** Seção de congressos e workshops alimentada via API, com suporte a links externos e descrições automáticas.
* **Banner e Notícias:** Implementação de banner em vídeo otimizado (167KB) e carrossel de notícias dinâmico via `noticias.json`.

## Tecnologias Utilizadas

* **Frontend:** HTML5 semântico, CSS3 (Variáveis, Grid e Flexbox) e JavaScript Vanilla (ES6+).
* **Bibliotecas:** * [FullCalendar 6.1](https://fullcalendar.io/) para gestão de escalas.
    * [Font Awesome](https://fontawesome.com/) para iconografia.
* **Arquitetura de Dados:** Estrutura preparada para integração com APIs em **.NET 8**.

## Estrutura de Manutenção (Low-Code)

Para permitir que equipes administrativas (RH/Secretaria) atualizem o portal sem tocar no código, o projeto inclui uma estrutura de suporte:

1.  **Pasta `/modelos-tabelas`:** Contém planilhas Excel (`.xlsx`) padronizadas que servem de base para a alimentação das APIs.
2.  **Integração:** O desenvolvedor backend utiliza esses modelos para gerar os JSONs consumidos pelo sistema.
3.  **Notícias:** Atualização simplificada via `js/noticias.json` para a equipe de TI local.

## 📁 Estrutura do Repositório

```text
PROJETO-INTRANET/
├── css/                # Estilização modular e regras de impressão (@media print)
├── js/                 # Lógica mestre: filtros, busca, PDF e conexões de API
├── modelos-tabelas/    # Templates Excel para preenchimento (Escalas, Férias, Eventos)
├── images/             # Ativos visuais e imagens do carrossel de notícias
├── pdfs/               # Repositório de documentos institucionais
└── index.html          # Estrutura principal do portal
```

👩‍💻 Sobre a Desenvolvedora
Thaís Cavalcante - Desenvolvedora Full Stack Jr.

Atualmente cursando Análise e Desenvolvimento de Sistemas, com foco em soluções práticas para o setor de genética e saúde, aplicando princípios de Clean Code, SOLID e automação de processos.