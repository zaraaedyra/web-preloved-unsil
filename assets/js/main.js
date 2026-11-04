// PRELOVEDU — Interaksi Halaman Utama (main.js)
import { renderHeader, renderBottomNav, showToast } from './components/navbar.js';
import { renderProductCard } from './components/product-card.js';
import { renderFavicon } from './components/logo.js';
import { getProducts, toggleFavorite, isFavorited } from './services/storage.js';
import { categoriesList, facultiesList } from './data/dummy-products.js';
import { icons } from './components/icons.js';

// State Filter Halaman Beranda
const state = {
  searchQuery: '',
  selectedCategory: 'all',
  selectedFaculty: 'Semua Fakultas',
  selectedCondition: 'all',
  sortBy: 'terbaru'
};

document.addEventListener('DOMContentLoaded', () => {
  // 1. Pasang Favicon SVG Otomatis
  const linkFavicon = document.createElement('link');
  linkFavicon.rel = 'icon';
  linkFavicon.type = 'image/svg+xml';
  linkFavicon.href = renderFavicon();
  document.head.appendChild(linkFavicon);

  // 2. Render Navigasi
  const headerMount = document.getElementById('header-mount');
  if (headerMount) headerMount.innerHTML = renderHeader('home', '');

  const bottomNavMount = document.getElementById('bottom-nav-mount');
  if (bottomNavMount) bottomNavMount.innerHTML = renderBottomNav('home', '');

  // 3. Render Kategori Chips
  renderCategories();

  // 4. Render Dropdown Fakultas
  renderFacultyDropdown();

  // 5. Render Banner Hero Hot Deals & Featured Item
  setupHeroInteractions();

  // 6. Render Grid Produk Pertama Kali
  applyFiltersAndRender();

  // 7. Pasang Event Listeners
  setupEventListeners();
});

/**
 * Render Chip Kategori Bulat
 */
function renderCategories() {
  const container = document.getElementById('categories-container');
  if (!container) return;

  container.innerHTML = categoriesList.map(cat => {
    const iconSvg = icons[cat.icon] ? icons[cat.icon](24, 2.5) : icons.tag(24, 2.5);
    const isActive = state.selectedCategory === cat.id ? 'active' : '';

    return `
      <button type="button" class="category-item ${isActive}" data-category-id="${cat.id}">
        <div class="category-circle">
          ${iconSvg}
        </div>
        <span class="category-label">${cat.label}</span>
      </button>
    `;
  }).join('');

  // Event click kategori
  container.querySelectorAll('.category-item').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.category-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.selectedCategory = btn.getAttribute('data-category-id');
      applyFiltersAndRender();
    });
  });
}

/**
 * Render Dropdown Fakultas/Jurusan
 */
function renderFacultyDropdown() {
  const select = document.getElementById('faculty-select');
  if (!select) return;

  select.innerHTML = facultiesList.map(fac => `
    <option value="${fac}">${fac}</option>
  `).join('');

  select.addEventListener('change', (e) => {
    state.selectedFaculty = e.target.value;
    applyFiltersAndRender();
  });
}

/**
 * Filter & Render Produk ke Grid
 */
function applyFiltersAndRender() {
  const grid = document.getElementById('products-grid');
  const resultCount = document.getElementById('products-count');
  if (!grid) return;

  const allProducts = getProducts();

  let filtered = allProducts.filter(item => {
    // 1. Search Query
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchSeller = item.seller.name.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchSeller) return false;
    }

    // 2. Kategori
    if (state.selectedCategory !== 'all' && item.category !== state.selectedCategory) {
      return false;
    }

    // 3. Fakultas
    if (state.selectedFaculty !== 'Semua Fakultas' && item.faculty !== state.selectedFaculty) {
      return false;
    }

    // 4. Kondisi
    if (state.selectedCondition !== 'all') {
      if (state.selectedCondition === 'seperti_baru' && item.condition !== 'Seperti baru') return false;
      if (state.selectedCondition === 'baik' && item.condition !== 'Baik') return false;
    }

    return true;
  });

  // Urutan (Sort)
  if (state.sortBy === 'termurah') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (state.sortBy === 'termahal') {
    filtered.sort((a, b) => b.price - a.price);
  } else {
    // Terbaru
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Tampilkan Jumlah
  if (resultCount) {
    resultCount.textContent = `Menampilkan ${filtered.length} barang pilihan`;
  }

  // Render Grid atau Empty State
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1;">
        <div class="empty-state-card">
          <div class="empty-state-icon">
            ${icons.search(34, 2.5)}
          </div>
          <h4 style="font-family:var(--font-serif); font-size:1.35rem; margin-bottom:0.5rem;">Tidak Ada Barang Ditemukan</h4>
          <p style="color:var(--ink-muted); font-size:0.9rem; margin-bottom:1.25rem;">
            Coba gunakan kata kunci lain atau reset filter kategori & fakultas.
          </p>
          <button type="button" id="btn-reset-filter" class="btn-pill btn-pill-lime">
            Reset Semua Filter
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-reset-filter')?.addEventListener('click', () => {
      state.searchQuery = '';
      state.selectedCategory = 'all';
      state.selectedFaculty = 'Semua Fakultas';
      state.selectedCondition = 'all';
      document.getElementById('search-input').value = '';
      document.getElementById('faculty-select').value = 'Semua Fakultas';
      renderCategories();
      applyFiltersAndRender();
    });
    return;
  }

  grid.innerHTML = filtered.map(item => renderProductCard(item, { basePath: '' })).join('');

  // Pasang Listener Favorit di tiap kartu
  attachFavoriteListeners(grid);
}

/**
 * Listener Tombol Favorit
 */
function attachFavoriteListeners(container) {
  container.querySelectorAll('.btn-favorite').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const productId = btn.getAttribute('data-fav-id');
      const nowFavorited = toggleFavorite(productId);

      if (nowFavorited) {
        btn.classList.add('favorited');
        btn.innerHTML = icons.heart(19, 2.5, true);
        showToast('❤️ Disimpan ke Favorit Anda');
      } else {
        btn.classList.remove('favorited');
        btn.innerHTML = icons.heart(19, 2.5, false);
        showToast('Barang dihapus dari Favorit');
      }
    });
  });
}

/**
 * Event Listeners Input Pencarian & Filter
 */
function setupEventListeners() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.searchQuery = e.target.value;
        applyFiltersAndRender();
      }, 200);
    });
  }

  // Filter Chips Kondisi
  document.querySelectorAll('.chip-filter[data-condition]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip-filter[data-condition]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.selectedCondition = chip.getAttribute('data-condition');
      applyFiltersAndRender();
    });
  });

  // Sort Dropdown / Chips
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      applyFiltersAndRender();
    });
  }
}

/**
 * Interaksi Dots Hero Banner
 */
function setupHeroInteractions() {
  const dots = document.querySelectorAll('.carousel-dot');
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      dots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
    });
  });
}
