# Portal Institucional IGEN

Este projeto representa a modernização completa da Intranet do **Instituto de Imunogenética (IGEN)**. O objetivo foi transformar um portal legado em uma plataforma ágil, responsiva e de fácil manutenção para as equipes de TI e Comunicação.

## Evolução e Melhorias
A nova interface foi projetada para otimizar o fluxo de trabalho no laboratório:
* **Interface Moderna:** Substituição do layout antigo baseado em tabelas por um design limpo com CSS Grid e Flexbox.
* **Banner Dinâmico:** Implementação de um banner em vídeo leve (167KB) que traz movimento e profissionalismo à home.
* **Motor de Notícias (JSON):** Sistema de carrossel dinâmico que consome dados de um arquivo `noticias.json`. Isso permite que a equipe de TI atualize conteúdos sem tocar no código HTML.
* **Central de Plantões:** Visualizador interativo de escalas (Diurno, Noturno e TI) com funcionalidade de zoom em imagens PNG.
* **Filtro de Ramais:** Busca em tempo real na tabela de contatos para agilizar a comunicação interna.

## Tecnologias Utilizadas
* **Frontend:** HTML5, CSS3 (Variáveis e Design Responsivo) e JavaScript Vanilla (ES6+).
* **Ícones:** [Lucide Icons](https://lucide.dev/) para uma interface leve e minimalista.
* **Arquitetura:** Estrutura preparada para integração e deploy em ambientes **.NET 8**.

## Estrutura do Projeto
```text
PROJETO-INTRANET/
├── css/             # Estilização modular e variáveis de cores institucionais
├── images/          # Identidade visual e ícones dos cards de acesso
│   └── noticias/    # Pasta dedicada às imagens do carrossel (slide1.png, slide2.png)
├── js/              # Lógica do sistema (main.js) e base de dados (noticias.json)
├── pdfs/            # Documentos e escalas de plantão em formato PDF/PNG
└── index.html       # Estrutura principal do portal
```

## Manutenção das Notícias

Para atualizar o carrossel de notícias:

1. Adicione a imagem PNG na pasta `images/noticias/`.
2. Abra o arquivo `js/noticias.json` e adicione o novo objeto:

```json
{
  "imagem": "images/noticias/nova-foto.png",
  "link": "[https://link-da-noticia.com](https://link-da-noticia.com)",
  "titulo": "Título da Notícia"
}
