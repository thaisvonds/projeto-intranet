document.addEventListener('DOMContentLoaded', function () {

  // 1. FILTRO DE BUSCA (RAMAIS)
  initRamalFilter();

  // 2. COLABORADORES (RAMAIS E ANIVERSARIANTES)
  initColaboradores();

  // 3. CALENDÁRIO DE PLANTÕES COM INFOS EXTRAS
  initPlantaoSection();

  // 4. CARROSSEL DE NOTÍCIAS
  initCarousel();

  // 5. EVENTOS / CONGRESSOS VIA API
  initEventosCongressos();
});

const RAMAIS_PAGE_SIZE = 10;
const BIRTHDAYS_PAGE_SIZE = 4;
let ramaisData = [];
let ramaisPage = 1;
let aniversariantesData = [];
let aniversariantesPage = 1;

function getApiUrl(path) {
  return path;
}

// 1. FILTRO DE BUSCA (RAMAIS)
function initRamalFilter() {
  var searchInput = document.getElementById('ramalSearch');
  if (!searchInput) return;

  searchInput.addEventListener('input', function () {
    ramaisPage = 1;
    renderRamaisPage();
  });
}

function getFilteredRamais() {
  const searchInput = document.getElementById('ramalSearch');
  const filter = (searchInput ? searchInput.value : '').toLowerCase();

  if (!filter) return ramaisData;

  return ramaisData.filter(function (item) {
    return [item.nome, item.setor, item.ramal].join(' ').toLowerCase().includes(filter);
  });
}

// 2. COLABORADORES (RAMAIS E ANIVERSARIANTES)
async function initColaboradores() {
  await Promise.all([
    loadRamais(),
    loadAniversariantes()
  ]);
}

async function loadRamais() {
  const ramalBody = document.getElementById('ramalTableBody');
  if (!ramalBody) return;

  try {
    const ramais = await fetchArrayStrict(getApiUrl('/api/colaboradores/ramais'), 'ramais');
    renderRamais(ramais);
  } catch (error) {
    console.error('Erro ao carregar ramais:', error);
    renderRamalMessage('Não foi possível carregar os ramais.');
  }
}

async function loadAniversariantes() {
  const birthdayBody = document.getElementById('birthdayTableBody');
  if (!birthdayBody) return;

  try {
    const aniversariantes = await fetchArrayStrict(getApiUrl('/api/colaboradores/aniversariantes'), 'aniversariantes');
    renderAniversariantes(aniversariantes);
  } catch (error) {
    console.error('Erro ao carregar aniversariantes:', error);
    renderBirthdayMessage('Não foi possível carregar os aniversariantes.');
  }
}

function renderRamais(ramais) {
  ramaisData = Array.isArray(ramais) ? ramais : [];
  ramaisPage = 1;
  renderRamaisPage();
}

function renderRamaisPage() {
  const ramalBody = document.getElementById('ramalTableBody');
  if (!ramalBody) return;

  const filteredRamais = getFilteredRamais();
  const totalPages = Math.max(1, Math.ceil(filteredRamais.length / RAMAIS_PAGE_SIZE));
  ramaisPage = Math.min(Math.max(ramaisPage, 1), totalPages);

  ramalBody.innerHTML = '';

  if (filteredRamais.length === 0) {
    renderRamalMessage('Nenhum ramal encontrado.');
    renderRamalPagination(0, 0);
    return;
  }

  filteredRamais
    .slice((ramaisPage - 1) * RAMAIS_PAGE_SIZE, ramaisPage * RAMAIS_PAGE_SIZE)
    .forEach(function (item) {
    const row = document.createElement('tr');
    const infoCell = document.createElement('td');
    const ramalCell = document.createElement('td');
    const nameEl = document.createElement('div');
    const sectorEl = document.createElement('div');

    nameEl.className = 'contact-name';
    nameEl.textContent = item.nome || '-';
    sectorEl.className = 'contact-sector';
    sectorEl.textContent = item.setor || '-';
    ramalCell.className = 'contact-ramal';
    ramalCell.textContent = item.ramal || '-';

    infoCell.appendChild(nameEl);
    infoCell.appendChild(sectorEl);
    row.appendChild(infoCell);
    row.appendChild(ramalCell);
    ramalBody.appendChild(row);
  });

  renderRamalPagination(filteredRamais.length, totalPages);
}

function renderRamalPagination(totalItems, totalPages) {
  const pagination = document.getElementById('ramalPagination');
  if (!pagination) return;

  pagination.innerHTML = '';

  if (totalItems === 0) {
    pagination.textContent = '0 ramais';
    return;
  }

  const prevButton = document.createElement('button');
  const nextButton = document.createElement('button');
  const status = document.createElement('span');

  prevButton.type = 'button';
  prevButton.textContent = 'Anterior';
  prevButton.disabled = ramaisPage <= 1;
  prevButton.addEventListener('click', function () {
    ramaisPage -= 1;
    renderRamaisPage();
  });

  nextButton.type = 'button';
  nextButton.textContent = 'Próxima';
  nextButton.disabled = ramaisPage >= totalPages;
  nextButton.addEventListener('click', function () {
    ramaisPage += 1;
    renderRamaisPage();
  });

  status.className = 'ramal-pagination-status';
  status.textContent = ramaisPage + ' / ' + totalPages + ' • ' + totalItems + ' ramais';

  pagination.appendChild(prevButton);
  pagination.appendChild(status);
  pagination.appendChild(nextButton);
}

function renderAniversariantes(aniversariantes) {
  aniversariantesData = Array.isArray(aniversariantes) ? aniversariantes : [];
  aniversariantesPage = 1;
  renderAniversariantesPage();
}

function renderAniversariantesPage() {
  const birthdayBody = document.getElementById('birthdayTableBody');
  if (!birthdayBody) return;

  const totalPages = Math.max(1, Math.ceil(aniversariantesData.length / BIRTHDAYS_PAGE_SIZE));
  aniversariantesPage = Math.min(Math.max(aniversariantesPage, 1), totalPages);

  birthdayBody.innerHTML = '';

  if (aniversariantesData.length === 0) {
    renderBirthdayMessage('Nenhum aniversariante neste mês.');
    renderBirthdayPagination(0, 0);
    return;
  }

  aniversariantesData
    .slice((aniversariantesPage - 1) * BIRTHDAYS_PAGE_SIZE, aniversariantesPage * BIRTHDAYS_PAGE_SIZE)
    .forEach(function (item) {
    const row = document.createElement('tr');
    const dayCell = document.createElement('td');
    const nameCell = document.createElement('td');
    const sectorCell = document.createElement('td');

    dayCell.textContent = item.dia || '-';
    nameCell.textContent = item.nome || '-';
    sectorCell.textContent = item.setor || '-';

    row.appendChild(dayCell);
    row.appendChild(nameCell);
    row.appendChild(sectorCell);
    birthdayBody.appendChild(row);
  });

  renderBirthdayPagination(aniversariantesData.length, totalPages);
}

function renderBirthdayPagination(totalItems, totalPages) {
  const pagination = document.getElementById('birthdayPagination');
  if (!pagination) return;

  pagination.innerHTML = '';

  if (totalItems === 0) {
    pagination.textContent = '0 aniversariantes';
    return;
  }

  const prevButton = document.createElement('button');
  const nextButton = document.createElement('button');
  const status = document.createElement('span');

  prevButton.type = 'button';
  prevButton.textContent = 'Anterior';
  prevButton.disabled = aniversariantesPage <= 1;
  prevButton.addEventListener('click', function () {
    aniversariantesPage -= 1;
    renderAniversariantesPage();
  });

  nextButton.type = 'button';
  nextButton.textContent = 'Próxima';
  nextButton.disabled = aniversariantesPage >= totalPages;
  nextButton.addEventListener('click', function () {
    aniversariantesPage += 1;
    renderAniversariantesPage();
  });

  status.className = 'birthday-pagination-status';
  status.textContent = aniversariantesPage + ' / ' + totalPages;

  pagination.appendChild(prevButton);
  pagination.appendChild(status);
  pagination.appendChild(nextButton);
}

function renderRamalMessage(message) {
  const ramalBody = document.getElementById('ramalTableBody');
  if (!ramalBody) return;

  ramalBody.innerHTML = '';
  const row = document.createElement('tr');
  row.setAttribute('data-empty-row', 'true');
  const cell = document.createElement('td');
  cell.colSpan = 2;
  cell.textContent = message;
  row.appendChild(cell);
  ramalBody.appendChild(row);

  const pagination = document.getElementById('ramalPagination');
  if (pagination) {
    pagination.textContent = '';
  }
}

function renderBirthdayMessage(message) {
  const birthdayBody = document.getElementById('birthdayTableBody');
  if (!birthdayBody) return;

  birthdayBody.innerHTML = '';
  const row = document.createElement('tr');
  const cell = document.createElement('td');
  cell.colSpan = 3;
  cell.textContent = message;
  row.appendChild(cell);
  birthdayBody.appendChild(row);

  const pagination = document.getElementById('birthdayPagination');
  if (pagination) {
    pagination.textContent = '';
  }
}

// 2. CALENDÁRIO DE PLANTÕES COM INFOS EXTRAS
function initPlantaoSection() {
  var calendarEl = document.getElementById('calendar');
  if (!calendarEl) return;

  const URL_ESCALA = getApiUrl('/api/escalas');
  const URL_FERIAS = getApiUrl('/api/ferias');
  const URL_FOLGAS = getApiUrl('/api/folgas');

  Promise.all([
    fetchArray(URL_ESCALA, 'escala'),
    fetchArray(URL_FERIAS, 'ferias'),
    fetchArray(URL_FOLGAS, 'folgas')
  ])
    .then(function ([escalaEvents, feriasData, folgasData]) {
      var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        buttonText: { today: 'Voltar', month: 'Mês', list: 'Lista' },
        allDayText: '',
        height: 'auto',
        dayMaxEvents: false,
        events: escalaEvents,
        eventClassNames: function (arg) {
          const activeTabEl = document.querySelector('.plantao-tab.is-active');
          const activeType = activeTabEl ? activeTabEl.getAttribute('data-type') : 'todos';
          const eventType = arg.event.extendedProps.tipo;

          // Lógica de Data Atual (Hoje)
          const hoje = new Date().toISOString().split('T')[0];
          const dataEvento = arg.event.startStr;

          const calendarSearchInput = document.getElementById('calendarSearch');
          const searchTerm = calendarSearchInput ? calendarSearchInput.value.toLowerCase() : '';
          const titleMatches = arg.event.title.toLowerCase().includes(searchTerm);

          // 1. Se a aba for 'hoje' e o evento não for de hoje, esconde.
          if (activeType === 'hoje' && dataEvento !== hoje) {
            return ['event-hidden'];
          }

          // 2. Filtro por tipo (Diurno/Noturno/TI) e busca por nome.
          if ((activeType !== 'todos' && activeType !== 'hoje' && activeType !== eventType) || !titleMatches) {
            return ['event-hidden'];
          }

          return [];
        },
        eventDidMount: function (info) {
          const tipo = info.event.extendedProps.tipo;
          if (tipo) {
            info.el.classList.add('event-' + tipo.toLowerCase());
          }
        }
      });

      // Renderiza somente após os dados da escala serem carregados.
      calendar.render();

      // B. PREENCHIMENTO DAS INFOS EXTRAS (FÉRIAS E FOLGAS)
      fillPlantaoInfoLists(feriasData, folgasData);

      // C. LÓGICA DAS ABAS (Com mudança de visualização)
      bindPlantaoTabs(calendar);

      // D. LÓGICA DA BUSCA
      bindPlantaoSearch(calendar);

      // E. EXPORTAÇÃO DO FULLCALENDAR PARA PDF
      bindPlantaoPdfExport();
    })
    .catch(function (error) {
      console.error('Erro ao carregar dados de plantão:', error);
    });
}

// Busca array por endpoint com fallback para evitar quebra da interface.
function fetchArray(url, label) {
  return fetch(url)
    .then(function (response) {
      if (!response.ok) {
        throw new Error(label + ' indisponivel (' + response.status + ')');
      }
      return response.json();
    })
    .then(function (data) {
      return Array.isArray(data) ? data : [];
    })
    .catch(function (error) {
      console.warn('Falha ao carregar ' + label + '. Usando lista vazia.', error);
      return [];
    });
}

async function fetchArrayStrict(url, label) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(label + ' indisponivel (' + response.status + ')');
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

// B. PREENCHIMENTO DAS INFOS EXTRAS (FÉRIAS E FOLGAS)
function fillPlantaoInfoLists(feriasData, folgasData) {
  const listaFerias = document.getElementById('lista-ferias');
  const listaFolgas = document.getElementById('lista-folgas');

  if (listaFerias) listaFerias.innerHTML = '';
  if (listaFolgas) listaFolgas.innerHTML = '';

  if (Array.isArray(feriasData) && listaFerias) {
    feriasData.forEach(function (item) {
      listaFerias.innerHTML += '<li><strong>' + item.nome + ':</strong> ' + item.periodo + '</li>';
    });
  }

  if (Array.isArray(folgasData) && listaFolgas) {
    folgasData.forEach(function (item) {
      listaFolgas.innerHTML += '<li><strong>' + item.nome + ':</strong> ' + item.detalhes + '</li>';
    });
  }
}

// C. LÓGICA DAS ABAS (Com mudança de visualização)
function bindPlantaoTabs(calendar) {
  document.querySelectorAll('.plantao-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.plantao-tab').forEach(function (t) {
        t.classList.remove('is-active');
      });

      this.classList.add('is-active');
      const type = this.getAttribute('data-type');

      // Se clicar em 'hoje', vai para visualização em lista do dia atual.
      if (type === 'hoje') {
        calendar.changeView('listDay');
      } else {
        // Se clicar em outra aba, volta para o calendário mensal.
        calendar.changeView('dayGridMonth');
      }

      calendar.render();
    });
  });
}

// D. LÓGICA DA BUSCA
function bindPlantaoSearch(calendar) {
  const calendarSearchInput = document.getElementById('calendarSearch');
  if (!calendarSearchInput) return;

  calendarSearchInput.addEventListener('input', function () {
    calendar.render();
  });
}

// E. EXPORTAÇÃO DO FULLCALENDAR PARA PDF
function bindPlantaoPdfExport() {
  const pdfButton = document.getElementById('calendarPdfBtn');
  const filteredOption = document.getElementById('calendarPdfFiltered');
  if (!pdfButton) return;

  pdfButton.addEventListener('click', function () {
    const calendarRoot = document.getElementById('calendar');
    if (!calendarRoot) return;

    const calendarClone = calendarRoot.cloneNode(true);
    const printFilteredOnly = filteredOption ? filteredOption.checked : true;

    // Quando desmarcado, remove apenas a classe que esconde eventos filtrados.
    if (!printFilteredOnly) {
      calendarClone.querySelectorAll('.event-hidden').forEach(function (eventEl) {
        eventEl.classList.remove('event-hidden');
      });
    }

    const titleEl = document.querySelector('.fc-toolbar-title');
    const title = titleEl ? titleEl.textContent : 'Escala de Plantões';
    const fullCalendarCss = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.css';

    const printWindow = window.open('', '_blank', 'width=1200,height=900');
    if (!printWindow) {
      alert('Não foi possível abrir a janela de impressão. Verifique se o bloqueador de pop-up está ativo.');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link rel="stylesheet" href="${fullCalendarCss}" />
  <style>
    body { margin: 0; padding: 16px; background: #fff; color: #1e293b; font-family: Arial, sans-serif; }
    .print-calendar-title { margin: 0 0 12px; font-size: 22px; font-weight: 700; }
    .print-calendar-wrap { border: 1px solid #dbe2ea; border-radius: 10px; padding: 12px; }
    .fc .fc-toolbar { margin-bottom: 12px; }
    .fc .fc-scrollgrid,
    .fc .fc-scrollgrid table {
      width: 100% !important;
      table-layout: fixed !important;
      border-spacing: 0 !important;
    }
    .fc .fc-daygrid-day-frame {
      min-height: 105px;
      height: auto;
    }
    .event-hidden {
      display: none !important;
    }
    .event-diurno .fc-event-title {
      color: #1f3b2d !important;
    }
    .event-noturno .fc-event-title {
      color: #1f3654 !important;
    }
    .event-ti .fc-event-title {
      color: #4a2f1a !important;
    }
    .fc {
      --fc-border-color: #7c8b9b;
    }
    .fc-theme-standard .fc-scrollgrid,
    .fc-theme-standard .fc-scrollgrid td,
    .fc-theme-standard .fc-scrollgrid th {
      border-color: #7c8b9b !important;
      border-style: solid !important;
      border-width: 1px !important;
    }
    @media print {
      body { padding: 0; }
      .print-calendar-wrap { border: 0; border-radius: 0; padding: 0; }
      .fc {
        --fc-border-color: #000;
      }
      .fc-theme-standard .fc-scrollgrid,
      .fc-theme-standard .fc-scrollgrid td,
      .fc-theme-standard .fc-scrollgrid th {
        border-color: #000 !important;
        border-style: solid !important;
        border-width: 1px !important;
      }
      * {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <h1 class="print-calendar-title">${title}</h1>
  <div class="print-calendar-wrap">${calendarClone.outerHTML}</div>
</body>
</html>`);
    printWindow.document.close();

    setTimeout(function () {
      printWindow.focus();
      printWindow.print();
    }, 500);
  });
}

// 3. CARROSSEL DE NOTÍCIAS
async function initCarousel() {
  const track = document.getElementById('newsTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  if (!track || !prevBtn || !nextBtn) return;

  try {
    const response = await fetch('js/noticias.json');
    const noticias = await response.json();

    track.innerHTML = '';
    noticias.forEach(function (noticia) {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';
      slide.innerHTML = '<a href="' + noticia.link + '" target="_blank"><img src="' + noticia.imagem + '" alt="' + noticia.titulo + '"></a>';
      track.appendChild(slide);
    });

    let index = 0;
    const total = noticias.length;
    if (total === 0) return;

    function updateSlide() {
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
    }

    function nextSlide() {
      index = (index + 1) % total;
      updateSlide();
    }

    function prevSlide() {
      index = (index - 1 + total) % total;
      updateSlide();
    }

    let timer = setInterval(nextSlide, 5000);

    nextBtn.addEventListener('click', function () {
      nextSlide();
      clearInterval(timer);
      timer = setInterval(nextSlide, 5000);
    });

    prevBtn.addEventListener('click', function () {
      prevSlide();
      clearInterval(timer);
      timer = setInterval(nextSlide, 5000);
    });
  } catch (error) {
    console.error('Erro no carrossel:', error);
  }
}

// 4. EVENTOS / CONGRESSOS VIA API
async function initEventosCongressos() {
  const URL_EVENTOS = getApiUrl('/api/eventos');
  const eventosContainer = document.getElementById('eventos-container');
  if (!eventosContainer) return;

  try {
    const listaEventos = await fetchArray(URL_EVENTOS, 'eventos');

    eventosContainer.innerHTML = '';

    if (listaEventos.length === 0) {
      eventosContainer.innerHTML = '<p>Eventos serão exibidos aqui assim que a API estiver disponível.</p>';
      return;
    }

    listaEventos.forEach(function (evento) {
      const card = document.createElement('div');
      card.className = 'congress-event';

      const dateEl = document.createElement('div');
      dateEl.className = 'congress-date';
      dateEl.textContent = evento.data || '-';

      const infoEl = document.createElement('div');

      const titleEl = document.createElement('div');
      titleEl.className = 'congress-title';
      titleEl.textContent = evento.titulo || 'Evento sem título';

      infoEl.appendChild(titleEl);

      if (evento.local) {
        const localEl = document.createElement('div');
        localEl.textContent = evento.local;
        infoEl.appendChild(localEl);
      }

      if (evento.link) {
        const linkEl = document.createElement('a');
        linkEl.className = 'congress-link';
        linkEl.href = evento.link;
        linkEl.target = '_blank';
        linkEl.rel = 'noopener noreferrer';
        linkEl.textContent = 'Saiba mais';
        infoEl.appendChild(linkEl);
      }

      card.appendChild(dateEl);
      card.appendChild(infoEl);
      eventosContainer.appendChild(card);
    });
  } catch (error) {
    console.error('Erro ao carregar Eventos/Congressos:', error);
    eventosContainer.innerHTML = '<p>Não foi possível carregar os eventos no momento.</p>';
  }
}
