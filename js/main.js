// ============================
// Portal Institucional IGEN
// main.js
// ============================

document.addEventListener('DOMContentLoaded', function () {

  // Mobile menu toggle
  var menuBtn = document.getElementById('mobileMenuBtn');
  var sidebar = document.getElementById('sidebarLeft');

  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', function () {
      sidebar.classList.toggle('open');
    });
  }

  // Right panel search filter
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

  // Header search (placeholder behavior)
  var headerSearch = document.getElementById('headerSearch');
  if (headerSearch) {
    headerSearch.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        alert('Busca: ' + this.value);
      }
    });
  }

  // Escalas de Plantões tabs + imagem PNG
  var plantaoTabs = document.querySelectorAll('.plantao-tab');
  var plantaoImageViewer = document.getElementById('plantaoImageViewer');

  if (plantaoTabs.length && plantaoImageViewer) {
    plantaoTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var imagePath = this.getAttribute('data-img');
        if (!imagePath) {
          return;
        }

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

  // Zoom da imagem de plantão
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
  }

});
