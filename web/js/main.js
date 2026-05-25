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
let feriasDataGlobal = [];
let folgasDataGlobal = [];

function getApiUrl(path) {
  return 'http://localhost:10638' + path;
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
        datesSet: function (info) {
          applyPlantaoFilters(calendar);
          updatePlantaoInfoByMonth(info.view.currentStart);
        },
        eventDidMount: function (info) {
          const tipo = info.event.extendedProps.tipo;
          info.el.dataset.eventType = tipo || '';
          info.el.dataset.eventTitle = info.event.title.toLowerCase();
          info.el.dataset.eventDate = formatLocalDate(info.event.start);

          if (tipo) {
            info.el.classList.add('event-' + tipo.toLowerCase());
          }

          applyPlantaoFilters(calendar);
        }
      });

      // Renderiza somente após os dados da escala serem carregados.
      calendar.render();
      applyPlantaoFilters(calendar);

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

function formatLocalDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return year + '-' + month + '-' + day;
}

function applyPlantaoFilters(calendar) {
  const activeTabEl = document.querySelector('.plantao-tab.is-active');
  const activeType = activeTabEl ? activeTabEl.getAttribute('data-type') : 'todos';
  const calendarSearchInput = document.getElementById('calendarSearch');
  const searchTerm = calendarSearchInput ? calendarSearchInput.value.trim().toLowerCase() : '';
  const hoje = formatLocalDate(new Date());

  calendar.el.querySelectorAll('.fc-event').forEach(function (eventEl) {
    const eventType = eventEl.dataset.eventType || '';
    const eventTitle = eventEl.dataset.eventTitle || '';
    const eventDate = eventEl.dataset.eventDate || '';
    const isTodayFilter = activeType === 'hoje';
    const matchesToday = !isTodayFilter || eventDate === hoje;
    const matchesType = isTodayFilter || activeType === 'todos' || activeType === eventType;
    const matchesSearch = !searchTerm || eventTitle.includes(searchTerm);

    eventEl.classList.toggle('event-hidden', !(matchesToday && matchesType && matchesSearch));
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
  feriasDataGlobal = Array.isArray(feriasData) ? feriasData : [];
  folgasDataGlobal = Array.isArray(folgasData) ? folgasData : [];
  
  // Preenche com os dados do mês atual
  updatePlantaoInfoByMonth(new Date());
}

function updatePlantaoInfoByMonth(dateInMonth) {
  const listaFerias = document.getElementById('lista-ferias');
  const listaFolgas = document.getElementById('lista-folgas');
  const currentMonth = dateInMonth.getMonth() + 1;
  const currentYear = dateInMonth.getFullYear();

  if (listaFerias) listaFerias.innerHTML = '';
  if (listaFolgas) listaFolgas.innerHTML = '';

  // Filtra férias do mês atual
  if (Array.isArray(feriasDataGlobal) && listaFerias) {
    const feriasMes = feriasDataGlobal.filter(function (item) {
      return _isInMonth(item.periodo, currentMonth, currentYear);
    });

    if (feriasMes.length === 0) {
      listaFerias.innerHTML = '<li>Nenhuma féria em ' + currentMonth + '/' + currentYear + '</li>';
    } else {
      feriasMes.forEach(function (item) {
        listaFerias.innerHTML += '<li><strong>' + item.nome + ':</strong> ' + item.periodo + '</li>';
      });
    }
  }

  // Filtra folgas do mês atual
  if (Array.isArray(folgasDataGlobal) && listaFolgas) {
    const folgasMes = folgasDataGlobal.filter(function (item) {
      return _isInMonth(item.detalhes, currentMonth, currentYear);
    });

    if (folgasMes.length === 0) {
      listaFolgas.innerHTML = '<li>Nenhuma folga em ' + currentMonth + '/' + currentYear + '</li>';
    } else {
      folgasMes.forEach(function (item) {
        listaFolgas.innerHTML += '<li><strong>' + item.nome + ':</strong> ' + item.detalhes + '</li>';
      });
    }
  }
}

function _isInMonth(periodoText, month, year) {
  if (!periodoText) return false;
  
  // Extrai datas do formato "DD/MM/YYYY a DD/MM/YYYY" ou "DD/MM/YYYY"
  const dateMatches = periodoText.match(/(\d{2})\/(\d{2})\/(\d{4})/g);
  if (!dateMatches) return false;

  for (let i = 0; i < dateMatches.length; i++) {
    const parts = dateMatches[i].split('/');
    const itemMonth = parseInt(parts[1], 10);
    const itemYear = parseInt(parts[2], 10);
    
    if (itemMonth === month && itemYear === year) {
      return true;
    }
  }

  return false;
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

      if (type === 'hoje') {
        calendar.changeView('listDay');
        calendar.gotoDate(new Date());
      } else {
        calendar.changeView('dayGridMonth');
      }

      applyPlantaoFilters(calendar);
    });
  });
}

// D. LÓGICA DA BUSCA
function bindPlantaoSearch(calendar) {
  const calendarSearchInput = document.getElementById('calendarSearch');
  if (!calendarSearchInput) return;

  calendarSearchInput.addEventListener('input', function () {
    applyPlantaoFilters(calendar);
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
    const printLogoUrl = new URL('images/logo-igen-cor.png', window.location.href).href;

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
    @page {
      size: A4 landscape;
      margin: 10mm;
    }
    :root {
      --print-navy: #103c7a;
      --print-navy-soft: #edf3fb;
      --print-border: #c8d5e6;
      --print-text: #17324d;
      --print-muted: #5d7289;
      --print-diurno: #c62828;
      --print-diurno-soft: #fdecec;
      --print-noturno: #0d47a1;
      --print-noturno-soft: #e9f1ff;
      --print-ti: #2e7d32;
      --print-ti-soft: #ebf7ec;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      margin: 0;
      background: #fff;
      color: var(--print-text);
      font-family: Aptos, 'Segoe UI', Calibri, Arial, sans-serif;
      font-size: 11px;
      line-height: 1.25;
    }
    .print-page {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .print-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 10px 12px;
      border: 1px solid var(--print-border);
      border-radius: 12px;
      background: linear-gradient(135deg, #ffffff 0%, var(--print-navy-soft) 100%);
    }
    .print-brand {
      display: flex;
      align-items: center;
      gap: 14px;
      min-width: 0;
    }
    .print-brand img {
      width: 132px;
      max-width: 100%;
      height: auto;
      display: block;
    }
    .print-brand-copy {
      min-width: 0;
    }
    .print-kicker {
      margin: 0 0 2px;
      font-size: 10px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--print-muted);
      font-weight: 700;
    }
    .print-calendar-title {
      margin: 0;
      font-size: 20px;
      line-height: 1.15;
      color: var(--print-navy);
      font-weight: 800;
    }
    .print-calendar-subtitle {
      margin: 3px 0 0;
      color: var(--print-muted);
      font-size: 10px;
    }
    .print-calendar-wrap {
      border: 1px solid var(--print-border);
      border-radius: 10px;
      padding: 8px;
      background: #fff;
    }
    .fc .fc-header-toolbar {
      display: none;
    }
    .fc .fc-scrollgrid,
    .fc .fc-scrollgrid table,
    .fc .fc-scrollgrid-sync-table {
      width: 100% !important;
      table-layout: fixed !important;
      border-spacing: 0 !important;
    }
    .fc .fc-scrollgrid-section > * {
      min-width: 0 !important;
    }
    .fc .fc-scroller,
    .fc .fc-scroller-liquid-absolute {
      overflow: visible !important;
    }
    .fc .fc-daygrid-body,
    .fc .fc-daygrid-body-balanced,
    .fc .fc-daygrid-body-unbalanced,
    .fc .fc-col-header {
      width: 100% !important;
    }
    .fc .fc-col-header,
    .fc .fc-daygrid-body table {
      margin: 0 !important;
    }
    .fc .fc-col-header-cell-cushion {
      padding: 4px 3px;
      color: var(--print-navy);
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      display: block;
      text-align: center;
    }
    .fc .fc-daygrid-day-number {
      color: var(--print-text);
      font-size: 10px;
      font-weight: 700;
      padding: 2px 4px 0;
    }
    .fc .fc-daygrid-day-frame {
      min-height: 58px;
      height: auto;
      padding: 1px;
    }
    .fc .fc-daygrid-day-top {
      justify-content: flex-end;
    }
    .fc .fc-daygrid-day-events {
      margin-top: 0;
      padding: 0 2px 1px;
    }
    .fc .fc-daygrid-event-harness {
      margin: 0 !important;
      padding: 0 !important;
    }
    .fc .fc-daygrid-event,
    .fc .fc-list-event {
      border-radius: 4px !important;
      border: 0 !important;
      box-shadow: none !important;
      font-size: 9.4px;
      font-weight: 700;
    }
    .fc .fc-daygrid-event {
      margin: 1px 0 0 !important;
      padding: 0 3px 0 5px;
      line-height: 1.1;
    }
    .fc .fc-event-title,
    .fc .fc-event-time,
    .fc .fc-list-event-title,
    .fc .fc-list-event-time {
      font-weight: 700;
    }
    .fc .fc-event-main {
      padding: 0 !important;
    }
    .fc .fc-event-main-frame {
      min-height: 0 !important;
      gap: 0 !important;
      line-height: 1.1;
    }
    .event-hidden {
      display: none !important;
    }
    .event-diurno {
      background: rgba(198, 40, 40, 0.06) !important;
      box-shadow: inset 3px 0 0 var(--print-diurno) !important;
    }
    .event-diurno .fc-event-title {
      color: var(--print-diurno) !important;
    }
    .event-diurno .fc-event-main,
    .event-diurno .fc-event-time {
      color: var(--print-diurno) !important;
    }
    .event-diurno .fc-list-event-dot {
      border-color: var(--print-diurno) !important;
      background: var(--print-diurno) !important;
    }
    .event-noturno {
      background: rgba(13, 71, 161, 0.06) !important;
      box-shadow: inset 3px 0 0 var(--print-noturno) !important;
    }
    .event-noturno .fc-event-title {
      color: var(--print-noturno) !important;
    }
    .event-noturno .fc-event-main,
    .event-noturno .fc-event-time {
      color: var(--print-noturno) !important;
    }
    .event-noturno .fc-list-event-dot {
      border-color: var(--print-noturno) !important;
      background: var(--print-noturno) !important;
    }
    .event-ti {
      background: rgba(46, 125, 50, 0.06) !important;
      box-shadow: inset 3px 0 0 var(--print-ti) !important;
    }
    .event-ti .fc-event-title {
      color: var(--print-ti) !important;
    }
    .event-ti .fc-event-main,
    .event-ti .fc-event-time {
      color: var(--print-ti) !important;
    }
    .event-ti .fc-list-event-dot {
      border-color: var(--print-ti) !important;
      background: var(--print-ti) !important;
    }
    .fc {
      --fc-border-color: var(--print-border);
    }
    .fc-theme-standard .fc-scrollgrid,
    .fc-theme-standard .fc-scrollgrid td,
    .fc-theme-standard .fc-scrollgrid th {
      border-color: var(--print-border) !important;
      border-style: solid !important;
      border-width: 1px !important;
    }
    .fc-theme-standard th {
      background: #f7fafe;
    }
    .fc .fc-list,
    .fc .fc-list-table {
      border-color: var(--print-border) !important;
    }
    .fc .fc-list-day-cushion {
      background: #f7fafe !important;
      color: var(--print-navy) !important;
      font-weight: 800;
    }
    @media print {
      body {
        padding: 0;
      }
      .print-header,
      .print-calendar-wrap {
        border-radius: 0;
      }
      .fc {
        --fc-border-color: #94a9bf;
      }
      .fc-theme-standard .fc-scrollgrid,
      .fc-theme-standard .fc-scrollgrid td,
      .fc-theme-standard .fc-scrollgrid th {
        border-color: #94a9bf !important;
        border-style: solid !important;
        border-width: 1px !important;
      }
      .fc .fc-daygrid-day-frame {
        min-height: 52px;
      }
    }
  </style>
</head>
<body>
  <div class="print-page">
    <header class="print-header">
      <div class="print-brand">
        <img src="${printLogoUrl}" alt="IGEN" />
        <div class="print-brand-copy">
          <p class="print-kicker">Portal Institucional</p>
          <h1 class="print-calendar-title">${title}</h1>
          <p class="print-calendar-subtitle">Escala de plantões preparada para impressão em A4.</p>
        </div>
      </div>
    </header>
    <div class="print-calendar-wrap">${calendarClone.outerHTML}</div>
  </div>
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
