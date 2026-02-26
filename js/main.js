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

  // Escalas de Plantões tabs + PDF iframe
  var plantaoTabs = document.querySelectorAll('.plantao-tab');
  var plantaoPdfViewer = document.getElementById('plantaoPdfViewer');

  if (plantaoTabs.length && plantaoPdfViewer) {
    plantaoTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var pdfPath = this.getAttribute('data-pdf');
        if (!pdfPath) {
          return;
        }

        plantaoTabs.forEach(function (item) {
          item.classList.remove('is-active');
          item.setAttribute('aria-selected', 'false');
        });

        this.classList.add('is-active');
        this.setAttribute('aria-selected', 'true');
        plantaoPdfViewer.setAttribute('src', pdfPath);
      });
    });
  }

});
