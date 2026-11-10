import { getProducts, saveProducts } from '../services/storage.js';
import { getWordmarkLogo } from './logo.js';

const KTM_STORAGE_KEY = 'prelovedu_admin_ktm_submissions';
const ACTIVE_PRODUCTS_COUNT_KEY = 'prelovedu_admin_active_count';
const REPORTS_COUNT_KEY = 'prelovedu_admin_report_count';

const sampleKtmApplications = [
  { id: 'ktm-257007111032', name: 'Azzahra', studentId: '257007111032', email: 'azzahra.257007111032@student.unsil.ac.id', status: 'Menunggu', submittedAt: '2026-11-10T09:15:00.000Z' },
  { id: 'ktm-257007111058', name: 'Fitria Nabila', studentId: '257007111058', email: 'fitria.257007111058@student.unsil.ac.id', status: 'Menunggu', submittedAt: '2026-11-10T08:20:00.000Z' },
  { id: 'ktm-257007111041', name: 'Raka Pratama', studentId: '257007111041', email: 'raka.257007111041@student.unsil.ac.id', status: 'Terverifikasi', submittedAt: '2026-11-09T14:10:00.000Z' },
  { id: 'ktm-257007111067', name: 'Nabila Putri', studentId: '257007111067', email: 'nabila.257007111067@student.unsil.ac.id', status: 'Menunggu', submittedAt: '2026-11-09T12:45:00.000Z' },
  { id: 'ktm-257007111024', name: 'Dimas Saputra', studentId: '257007111024', email: 'dimas.257007111024@student.unsil.ac.id', status: 'Terverifikasi', submittedAt: '2026-11-08T10:30:00.000Z' },
  { id: 'ktm-257007111089', name: 'Alif Maulana', studentId: '257007111089', email: 'alif.257007111089@student.unsil.ac.id', status: 'Menunggu', submittedAt: '2026-11-08T08:05:00.000Z' },
  { id: 'ktm-257007111074', name: 'Citra Lestari', studentId: '257007111074', email: 'citra.257007111074@student.unsil.ac.id', status: 'Ditolak', submittedAt: '2026-11-07T15:40:00.000Z' },
  { id: 'ktm-257007111093', name: 'Putri Amelia', studentId: '257007111093', email: 'putri.257007111093@student.unsil.ac.id', status: 'Menunggu', submittedAt: '2026-11-07T13:25:00.000Z' },
  { id: 'ktm-257007111006', name: 'Farhan Akbar', studentId: '257007111006', email: 'farhan.257007111006@student.unsil.ac.id', status: 'Menunggu', submittedAt: '2026-11-06T11:15:00.000Z' },
  { id: 'ktm-257007111025', name: 'Salsabila Rahma', studentId: '257007111025', email: 'salsabila.257007111025@student.unsil.ac.id', status: 'Terverifikasi', submittedAt: '2026-11-06T08:50:00.000Z' },
  { id: 'ktm-257007111081', name: 'Reza Ramadhan', studentId: '257007111081', email: 'reza.257007111081@student.unsil.ac.id', status: 'Menunggu', submittedAt: '2026-11-05T16:05:00.000Z' },
  { id: 'ktm-257007111055', name: 'Intan Permata', studentId: '257007111055', email: 'intan.257007111055@student.unsil.ac.id', status: 'Menunggu', submittedAt: '2026-11-05T09:20:00.000Z' }
];

function readArray(key, fallback) {
  const raw = localStorage.getItem(key);

  if (raw === null) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }

  try {
    const value = JSON.parse(raw);
    if (Array.isArray(value)) return value;
  } catch {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }

  localStorage.setItem(key, JSON.stringify(fallback));
  return fallback;
}

function readCount(key, fallback) {
  const raw = localStorage.getItem(key);

  if (raw === null) {
    localStorage.setItem(key, String(fallback));
    return fallback;
  }

  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

function formatPrice(value) {
  const price = Number(value);
  if (!Number.isFinite(price)) return '—';

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(price);
}

function getKtmStatusClass(status) {
  if (status === 'Terverifikasi') return 'admin-status--verified';
  if (status === 'Ditolak') return 'admin-status--rejected';
  return 'admin-status--waiting';
}

function renderKtmRows(applications) {
  const tableBody = document.getElementById('ktm-table-body');

  if (!applications.length) {
    tableBody.innerHTML = '<tr><td class="admin-empty-state" colspan="5">Belum ada pengajuan KTM.</td></tr>';
    return;
  }

  tableBody.innerHTML = applications.map(application => {
    const status = ['Terverifikasi', 'Ditolak'].includes(application.status)
      ? application.status
      : 'Menunggu';
    const actions = status === 'Menunggu'
      ? `<div class="admin-action-group">
          <button class="admin-action-button admin-action-button--approve" type="button" data-ktm-action="approve" data-id="${escapeHtml(application.id)}" aria-label="Setujui ${escapeHtml(application.name)}">Setujui</button>
          <button class="admin-action-button admin-action-button--reject" type="button" data-ktm-action="reject" data-id="${escapeHtml(application.id)}" aria-label="Tolak ${escapeHtml(application.name)}">Tolak</button>
        </div>`
      : '<span class="admin-action-placeholder">Sudah ditinjau</span>';

    return `<tr>
      <td><span class="admin-primary-text">${escapeHtml(application.name)}</span><span class="admin-secondary-text">Diajukan ${formatDate(application.submittedAt)}</span></td>
      <td>${escapeHtml(application.studentId)}</td>
      <td>${escapeHtml(application.email)}</td>
      <td><span class="admin-status ${getKtmStatusClass(status)}">${escapeHtml(status)}</span></td>
      <td>${actions}</td>
    </tr>`;
  }).join('');
}

function getProductStatus(product) {
  if (product.status === 'terjual') return { label: 'Terjual', className: 'admin-status--sold' };
  if (product.status === 'dalam_proses_cod') return { label: 'Proses COD', className: 'admin-status--cod' };
  return { label: 'Aktif', className: 'admin-status--active' };
}

function renderProductRows(products, query) {
  const tableBody = document.getElementById('products-table-body');
  const normalizedQuery = query.trim().toLocaleLowerCase('id-ID');
  const filteredProducts = products.filter(product => {
    const searchableText = `${product.title || ''} ${product.category || ''} ${product.seller?.name || ''}`;
    return searchableText.toLocaleLowerCase('id-ID').includes(normalizedQuery);
  });

  if (!filteredProducts.length) {
    tableBody.innerHTML = `<tr><td class="admin-empty-state" colspan="5">${normalizedQuery ? 'Tidak ada postingan yang cocok.' : 'Belum ada postingan untuk dimoderasi.'}</td></tr>`;
    return;
  }

  tableBody.innerHTML = filteredProducts.map(product => {
    const status = getProductStatus(product);
    const title = product.title || 'Barang tanpa judul';
    const seller = product.seller?.name || 'Penjual';

    return `<tr>
      <td><span class="admin-primary-text">${escapeHtml(title)}</span><span class="admin-secondary-text">${escapeHtml(seller)} · ${formatDate(product.createdAt)}</span></td>
      <td>${escapeHtml(product.category || '—')}</td>
      <td>${formatPrice(product.price)}</td>
      <td><span class="admin-status ${status.className}">${status.label}</span></td>
      <td><button class="admin-action-button admin-action-button--delete" type="button" data-product-delete="${escapeHtml(product.id)}" aria-label="Hapus postingan ${escapeHtml(title)}">Hapus Postingan</button></td>
    </tr>`;
  }).join('');
}

function renderDashboard() {
  const applications = readArray(KTM_STORAGE_KEY, sampleKtmApplications);
  const activeProductsCount = readCount(ACTIVE_PRODUCTS_COUNT_KEY, 45);
  const reportsCount = readCount(REPORTS_COUNT_KEY, 2);
  const products = getProducts();

  document.getElementById('stat-ktm-total').textContent = String(applications.length);
  document.getElementById('stat-active-products').textContent = String(activeProductsCount);
  document.getElementById('stat-reports').textContent = String(reportsCount);
  document.getElementById('ktm-count-label').textContent = `${applications.length} pengajuan`;

  renderKtmRows(applications);
  renderProductRows(products, document.getElementById('product-search').value);
}

function updateKtmStatus(applicationId, action) {
  const applications = readArray(KTM_STORAGE_KEY, sampleKtmApplications);
  const nextStatus = action === 'approve' ? 'Terverifikasi' : 'Ditolak';
  const applicationIndex = applications.findIndex(application => String(application.id) === applicationId);

  if (applicationIndex === -1 || applications[applicationIndex].status !== 'Menunggu') return;

  applications[applicationIndex] = {
    ...applications[applicationIndex],
    status: nextStatus,
    reviewedAt: new Date().toISOString()
  };
  localStorage.setItem(KTM_STORAGE_KEY, JSON.stringify(applications));
  renderDashboard();
}

function deleteProduct(productId) {
  const products = getProducts();
  const product = products.find(item => String(item.id) === productId);
  if (!product) return;

  const title = product.title || 'postingan ini';
  if (!window.confirm(`Hapus "${title}" dari marketplace?`)) return;

  saveProducts(products.filter(item => String(item.id) !== productId));

  if (product.status !== 'terjual') {
    const currentCount = readCount(ACTIVE_PRODUCTS_COUNT_KEY, 45);
    localStorage.setItem(ACTIVE_PRODUCTS_COUNT_KEY, String(Math.max(0, currentCount - 1)));
  }

  renderDashboard();
}

export function initAdminDashboard() {
  const brand = document.getElementById('admin-brand-logo');
  const ktmTableBody = document.getElementById('ktm-table-body');
  const productsTableBody = document.getElementById('products-table-body');
  const productSearch = document.getElementById('product-search');

  if (!brand || !ktmTableBody || !productsTableBody || !productSearch) return;

  brand.innerHTML = getWordmarkLogo({ height: 32 });
  renderDashboard();

  ktmTableBody.addEventListener('click', event => {
    const button = event.target.closest('button[data-ktm-action]');
    if (!button) return;
    updateKtmStatus(button.dataset.id, button.dataset.ktmAction);
  });

  productsTableBody.addEventListener('click', event => {
    const button = event.target.closest('button[data-product-delete]');
    if (!button) return;
    deleteProduct(button.dataset.productDelete);
  });

  productSearch.addEventListener('input', renderDashboard);
  window.addEventListener('storage', event => {
    if ([KTM_STORAGE_KEY, ACTIVE_PRODUCTS_COUNT_KEY, REPORTS_COUNT_KEY, 'prelovedu_products'].includes(event.key)) {
      renderDashboard();
    }
  });
}
