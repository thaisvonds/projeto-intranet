document.addEventListener('DOMContentLoaded', function () {

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

  // 2. ESCALAS DE PLANTÕES (TABS)
  var plantaoTabs = document.querySelectorAll('.plantao-tab');
  var plantaoImageViewer = document.getElementById('plantaoImageViewer');

  if (plantaoTabs.length && plantaoImageViewer) {
    plantaoTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var imagePath = this.getAttribute('data-img');
        if (!imagePath) return;

        plantaoTabs.forEach(function (item) {
          item.classList.remove('is-active');
          item.setAttribute('aria-selected', 'false');
        });

        this.classList.add('is-active');
        this.setAttribute('aria-selected', 'true');
        plantaoImageViewer.setAttribute('src', imagePath);
      });
    });
  }

  // 3. ZOOM DA IMAGEM DE PLANTÃO
  var imageZoomModal = document.getElementById('imageZoomModal');
  var imageZoomModalImg = document.getElementById('imageZoomModalImg');
  var imageZoomClose = document.getElementById('imageZoomClose');
  var imageZoomBackdrop = document.getElementById('imageZoomBackdrop');

  if (plantaoImageViewer && imageZoomModal && imageZoomModalImg && imageZoomClose && imageZoomBackdrop) {
    var openImageZoom = function () {
      imageZoomModalImg.setAttribute('src', plantaoImageViewer.getAttribute('src') || '');
      imageZoomModalImg.setAttribute('alt', plantaoImageViewer.getAttribute('alt') || 'Imagem ampliada');
      imageZoomModal.classList.add('is-open');
      imageZoomModal.setAttribute('aria-hidden', 'false');
    };

    var closeImageZoom = function () {
      imageZoomModal.classList.remove('is-open');
      imageZoomModal.setAttribute('aria-hidden', 'true');
    };

    plantaoImageViewer.addEventListener('click', openImageZoom);
    imageZoomClose.addEventListener('click', closeImageZoom);
    imageZoomBackdrop.addEventListener('click', closeImageZoom);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && imageZoomModal.classList.contains('is-open')) {
        closeImageZoom();
      }
    });
  }

  // 4. CARROSSEL DE NOTÍCIAS (JSON)
  async function initCarousel() {
    const track = document.getElementById('newsTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (!track || !prevBtn || !nextBtn) return;

    try {
      // Busca os dados do JSON
      const response = await fetch('js/noticias.json');
      if (!response.ok) throw new Error('Erro ao carregar o arquivo JSON');

      const noticias = await response.json();

      if (noticias.length === 0) {
        track.innerHTML = '<div class="loading-msg">Nenhuma notícia disponível.</div>';
        return;
      }

      // Limpa e monta os slides
      track.innerHTML = '';
      noticias.forEach(noticia => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.innerHTML = `
          <a href="${noticia.link}" target="_blank">
            <img src="${noticia.imagem}" alt="${noticia.titulo}">
          </a>
        `;
        track.appendChild(slide);
      });

      // Lógica de movimento
      let index = 0;
      const total = noticias.length;

      function updateSlide() {
        track.style.transform = `translateX(-${index * 100}%)`;
      }

      function nextSlide() {
        index = (index + 1) % total;
        updateSlide();
      }

      function prevSlide() {
        index = (index - 1 + total) % total;
        updateSlide();
      }

      // Timer Automático (3 segundos)
      let timer = setInterval(nextSlide, 3000);

      // Eventos dos botões
      nextBtn.addEventListener('click', () => {
        nextSlide();
        clearInterval(timer);
        timer = setInterval(nextSlide, 3000);
      });

      prevBtn.addEventListener('click', () => {
        prevSlide();
        clearInterval(timer);
        timer = setInterval(nextSlide, 3000);
      });

      // Recarrega ícones do Lucide para os botões do carrossel
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }

    } catch (error) {
      console.error('Erro no carrossel:', error);
      track.innerHTML = '<div class="loading-msg">Erro ao carregar notícias. Verifique o console.</div>';
    }
  }

  // Inicializa o carrossel
  initCarousel();

  // 5. STATUS PROCESSAMENTO DESEMPENHO (GOOGLE CHARTS)
  async function initStatusProcessamentoDesempenho() {
    var chartElement = document.getElementById('chart_div');
    var statusLabel = document.getElementById('statusDesempenhoLabel');

    if (!chartElement || !statusLabel) return;

    var applyFallback = function (message) {
      chartElement.innerHTML = '';
      statusLabel.textContent = message;
    };

    try {
      var response = await fetch('js/status-processamento-desempenho.json');
      if (!response.ok) throw new Error('Erro ao carregar JSON de status');

      var statusData = await response.json();
      var valorAtual = Number(statusData.valorAtual);
      if (Number.isNaN(valorAtual)) valorAtual = 0;

      var label = statusData.label || 'Eficiência';
      if (typeof google !== 'undefined') {
        google.charts.load('current', { packages: ['gauge'] });
      }

      async function initStatusProcessamentoDesempenho() {
      }

      google.charts.load('current', { packages: ['gauge'] });
      google.charts.setOnLoadCallback(function () {
        var data = google.visualization.arrayToDataTable([
          ['Label', 'Value'],
          ['Desempenho', valorAtual]
        ]);
        var options = {
          height: 190,
          min: 0,
          max: 100,
          redFrom: 0,
          redTo: 50,
          yellowFrom: 50,
          yellowTo: 75,
          greenFrom: 75,
          greenTo: 100,
          minorTicks: 5
        };

        var chart = new google.visualization.Gauge(chartElement);
        chart.draw(data, options);
        statusLabel.textContent = label + ': ' + valorAtual + '%';

        window.addEventListener('resize', function () {
          chart.draw(data, options);
        });
      });
    } catch (error) {
      console.error('Erro ao carregar status de desempenho:', error);
      applyFallback('Não foi possível carregar o status de desempenho.');
    }
  }

  initStatusProcessamentoDesempenho();

});