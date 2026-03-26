document.addEventListener('DOMContentLoaded', function () {

  /*
  function initSlidesCover() {
    var slideCovers = document.querySelectorAll('.news-slides-cover');

    slideCovers.forEach(function (cover) {
      var iframe = cover.querySelector('.news-slides-embed');
      if (!iframe) return;

      var baseWidth = Number(iframe.getAttribute('data-base-width') || cover.getAttribute('data-base-width') || 1000);
      var baseHeight = Number(iframe.getAttribute('data-base-height') || cover.getAttribute('data-base-height') || 300);

      function applyCoverScale() {
        var rect = cover.getBoundingClientRect();
        if (!rect.width || !rect.height || !baseWidth || !baseHeight) return;

        var scale = Math.max(rect.width / baseWidth, rect.height / baseHeight);
        iframe.style.width = baseWidth + 'px';
        iframe.style.height = baseHeight + 'px';
        iframe.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
      }

      applyCoverScale();

      if ('ResizeObserver' in window) {
        var observer = new ResizeObserver(function () {
          applyCoverScale();
        });
        observer.observe(cover);
      }

      window.addEventListener('resize', applyCoverScale);
    });
  }

  initSlidesCover();
  */

  // 1. FILTRO DE BUSCA (RAMAIS)
  var searchInput = document.getElementById('ramalSearch');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      var filter = this.value.toLowerCase();
      var rows = document.querySelectorAll('#ramalTable tbody tr');
      rows.forEach(function (row) {
        var text = row.textContent.toLowerCase();
        row.style.display = text.indexOf(filter) > -1 ? '' : 'none';
      });
    });
  }

// 2. NOVO CALENDÁRIO DE PLANTÕES COM INFOS EXTRAS
var calendarEl = document.getElementById('calendar');

if (calendarEl) {
  const DATA_SOURCE = 'js/plantao.json'; 

  fetch(DATA_SOURCE)
    .then(response => response.json())
    .then(data => {
      
      var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        buttonText: { today: 'Voltar', month: 'Mês', list: 'Lista' },
        allDayText: '',
        height: 'auto',
        dayMaxEvents: false,
        events: data.events, 
        
        eventClassNames: function(arg) {
          const activeTabEl = document.querySelector('.plantao-tab.is-active');
          const activeType = activeTabEl ? activeTabEl.getAttribute('data-type') : 'todos';
          const eventType = arg.event.extendedProps.tipo; 
          
          // Lógica de Data Atual (Hoje)
          const hoje = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
          const dataEvento = arg.event.startStr;

          const searchInput = document.getElementById('calendarSearch');
          const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
          const titleMatches = arg.event.title.toLowerCase().includes(searchTerm);

          // 1. Se a aba for 'hoje' e o evento não for de hoje, esconde
          if (activeType === 'hoje' && dataEvento !== hoje) {
            return ['event-hidden'];
          }

          // 2. Filtro por tipo (Diurno/Noturno/TI) e busca por nome
          if ((activeType !== 'todos' && activeType !== 'hoje' && activeType !== eventType) || !titleMatches) {
            return ['event-hidden']; 
          }
          return [];
        },

        eventDidMount: function(info) {
          const tipo = info.event.extendedProps.tipo;
          if (tipo) {
            info.el.classList.add('event-' + tipo.toLowerCase());
          }
        }
      });

      calendar.render();

      // B. PREENCHIMENTO DAS INFOS EXTRAS (FÉRIAS E FOLGAS)
      const listaFerias = document.getElementById('lista-ferias');
      const listaFolgas = document.getElementById('lista-folgas');

      if(listaFerias) listaFerias.innerHTML = '';
      if(listaFolgas) listaFolgas.innerHTML = '';

      if (data.ferias && listaFerias) {
        data.ferias.forEach(item => {
          listaFerias.innerHTML += `<li><strong>${item.nome}:</strong> ${item.periodo}</li>`;
        });
      }

      if (data.folgas && listaFolgas) {
        data.folgas.forEach(item => {
          listaFolgas.innerHTML += `<li><strong>${item.nome}:</strong> ${item.detalhes}</li>`;
        });
      }

      // C. LÓGICA DAS ABAS (Com mudança de visualização)
      document.querySelectorAll('.plantao-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
          document.querySelectorAll('.plantao-tab').forEach(t => t.classList.remove('is-active'));
          this.classList.add('is-active');
          
          const type = this.getAttribute('data-type');
          
          // Se clicar em 'hoje', vai para a visualização de lista do dia atual
          if (type === 'hoje') {
            calendar.changeView('listDay'); 
          } else {
            // Se clicar em qualquer outra aba, volta para o calendário mensal
            calendar.changeView('dayGridMonth');
          }

          calendar.render(); 
        });
      });

      // D. LÓGICA DA BUSCA
      const searchInput = document.getElementById('calendarSearch');
      if (searchInput) {
        searchInput.addEventListener('input', function() {
          calendar.render();
        });
      }

    })
    .catch(error => console.error('Erro ao carregar plantão:', error));
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
      noticias.forEach(noticia => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.innerHTML = `<a href="${noticia.link}" target="_blank"><img src="${noticia.imagem}" alt="${noticia.titulo}"></a>`;
        track.appendChild(slide);
      });

      let index = 0;
      const total = noticias.length;
      if (total === 0) return;

      function updateSlide() { track.style.transform = `translateX(-${index * 100}%)`; }
      function nextSlide() { index = (index + 1) % total; updateSlide(); }
      function prevSlide() { index = (index - 1 + total) % total; updateSlide(); }
      
      let timer = setInterval(nextSlide, 5000);
      nextBtn.addEventListener('click', () => { nextSlide(); clearInterval(timer); timer = setInterval(nextSlide, 5000); });
      prevBtn.addEventListener('click', () => { prevSlide(); clearInterval(timer); timer = setInterval(nextSlide, 5000); });
    } catch (error) { console.error('Erro no carrossel:', error); }
  }
  initCarousel();

  // 4. GOOGLE CHARTS (DESEMPENHO)
  async function initStatusProcessamentoDesempenho() {
    var chartElement = document.getElementById('chart_div');
    var statusLabel = document.getElementById('statusDesempenhoLabel');
    if (!chartElement || !statusLabel) return;

    try {
      var response = await fetch('js/status-processamento-desempenho.json');
      var statusData = await response.json();
      var valorAtual = Number(statusData.valorAtual) || 0;

      google.charts.load('current', { packages: ['gauge'] });
      google.charts.setOnLoadCallback(function () {
        var data = google.visualization.arrayToDataTable([['Label', 'Value'], ['%', valorAtual]]);
        var options = { height: 190, redFrom: 0, redTo: 50, yellowFrom: 50, yellowTo: 75, greenFrom: 75, greenTo: 100 };
        var chart = new google.visualization.Gauge(chartElement);
        chart.draw(data, options);
        statusLabel.textContent = (statusData.label || 'Eficiência') + ': ' + valorAtual + '%';
      });
    } catch (error) { console.error('Erro desempenho:', error); }
  }
  initStatusProcessamentoDesempenho();

});