// PRELOVEDU — Storage & State Service (storage.js)
// Lapisan data terpisah untuk memudahkan transisi dari LocalStorage ke Firebase Firestore (Fase 2)

import { dummyProducts, normalizeFaculty } from '../data/dummy-products.js';
import { campusSpots } from '../data/campus-spots.js';
import {
  getAuthUiState,
  LEGACY_DEMO_USER_ID,
  LEGACY_DEMO_USER_NAME,
  USER_STORAGE_KEY
} from './auth.js';

export const STORAGE_KEYS = {
  PRODUCTS: 'prelovedu_products',
  FAVORITES: 'prelovedu_favorites',
  OFFERS: 'prelovedu_offers',
  USER: USER_STORAGE_KEY
};

/**
 * Inisialisasi data produk ke LocalStorage jika belum ada atau jika masih data lama (SVG)
 */
export function initStorage() {
  const currentProds = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (!currentProds || currentProds.includes('.svg')) {
    const initialProducts = dummyProducts.map(p => ({
      ...p,
      status: p.id === 'prd-002' ? 'dalam_proses_cod' : (p.status || 'tersedia')
    }));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
  }

  if (!localStorage.getItem(STORAGE_KEYS.FAVORITES)) {
    // Inisialisasi awal dengan 2 produk favorit contoh
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(['prd-001', 'prd-003']));
  }

  const currentOffers = localStorage.getItem(STORAGE_KEYS.OFFERS);
  if (!currentOffers || currentOffers.includes('.svg')) {
    // Tawaran contoh untuk simulasi alur Tawar lengkap (Terkirim & Masuk)
    const initialOffers = [
      {
        id: 'prd-002_guest',
        productId: 'prd-002',
        productTitle: 'Jas Laboratorium Kimia FMIPA Bahan Katun Tebal Size L',
        productImage: 'assets/img/products/prd-002-1.jpg',
        sellerId: 'usr-anisa',
        sellerName: 'Anisa Rahmawati',
        sellerPhone: '628987654321',
        buyerId: 'guest',
        buyerName: 'GUEST',
        buyerPhone: '',
        hargaListing: 45000,
        hargaTawar: 40000,
        catatan: 'Bisa COD di depan gedung rektorat kak?',
        status: 'diterima', // menunggu | ditawar_balik | diterima | ditolak | kedaluwarsa | dibatalkan
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        expiresAt: new Date(Date.now() + 3600000 * 44).toISOString()
      },
      {
        id: 'prd-003_guest',
        productId: 'prd-003',
        productTitle: 'Hoodie Kampus Vintage Boxy Cut Sage Green Unisex',
        productImage: 'assets/img/products/prd-003-1.jpg',
        sellerId: 'usr-dimas',
        sellerName: 'Dimas Setiawan',
        sellerPhone: '6281399887766',
        buyerId: 'guest',
        buyerName: 'GUEST',
        buyerPhone: '',
        hargaListing: 85000,
        hargaTawar: 70000,
        hargaBalik: 78000,
        catatan: 'Kalau 70rb boleh kak? Buat ganti hoodie kuliah.',
        status: 'ditawar_balik',
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        expiresAt: new Date(Date.now() + 3600000 * 40).toISOString()
      },
      {
        id: 'prd-004_guest',
        productId: 'prd-004',
        productTitle: 'Kalkulator Saintifik Casio fx-991EX ClassWiz Original',
        productImage: 'assets/img/products/prd-004-1.jpg',
        sellerId: 'usr-fauzan',
        sellerName: 'Fauzan Hidayat',
        sellerPhone: '6281122334455',
        buyerId: 'guest',
        buyerName: 'GUEST',
        buyerPhone: '',
        hargaListing: 180000,
        hargaTawar: 160000,
        catatan: 'Bisa dicek solar cell-nya pas COD ya kak.',
        status: 'menunggu',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        expiresAt: new Date(Date.now() + 3600000 * 46).toISOString()
      },
      {
        id: 'prd-001_usr-budi',
        productId: 'prd-001',
        productTitle: 'Kalkulus Purcell Edisi 9 Jilid 1',
        productImage: 'assets/img/products/prd-001-1.jpg',
        sellerId: 'guest',
        sellerName: 'GUEST',
        sellerPhone: '',
        buyerId: 'usr-budi',
        buyerName: 'Budi Santoso (Teknik Mesin 2024)',
        buyerPhone: '6287766554433',
        hargaListing: 65000,
        hargaTawar: 55000,
        catatan: 'Halo kak, apakah boleh 55rb? COD perpustakaan pusat besok siang.',
        status: 'menunggu',
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        expiresAt: new Date(Date.now() + 3600000 * 45).toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(initialOffers));
  }

}

/**
 * Pastikan produk memiliki informasi titik COD valid
 */
export function ensureProductCodLocation(product) {
  if (!product) return null;
  if (product.codLocation && product.codLocation.lat && product.codLocation.lng) {
    return product;
  }

  // Fallback preset berdasarkan fakultas / ID
  const isKampus2 = product.faculty === 'Pertanian' || product.faculty === 'FP' || product.faculty === 'FISIP' || (product.id && product.id.endsWith('3'));
  const campusId = isKampus2 ? 'kampus-2' : 'kampus-1';
  const campus = campusSpots[campusId] || campusSpots['kampus-1'];
  const spots = campus.spots;
  const hash = (product.id || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const spot = spots[Math.abs(hash) % spots.length];

  return {
    ...product,
    status: product.status || 'tersedia',
    codLocation: {
      campus: campusId,
      campusName: campus.name,
      spotId: spot.id,
      lat: spot.lat,
      lng: spot.lng,
      spotName: spot.name
    }
  };
}

/**
 * Mendapatkan seluruh daftar produk
 */
export function getProducts() {
  initStorage();
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS)) || dummyProducts;
    return raw.map(product => ensureProductCodLocation({
      ...product,
      faculty: normalizeFaculty(product.faculty),
      seller: product.seller
        ? { ...product.seller, faculty: normalizeFaculty(product.seller.faculty) }
        : product.seller
    }));
  } catch (e) {
    return dummyProducts.map(product => ensureProductCodLocation({
      ...product,
      faculty: normalizeFaculty(product.faculty),
      seller: product.seller
        ? { ...product.seller, faculty: normalizeFaculty(product.seller.faculty) }
        : product.seller
    }));
  }
}

/**
 * Mendapatkan produk berdasarkan ID
 */
export function getProductById(id) {
  const products = getProducts();
  const prod = products.find(p => p.id === id) || null;
  return prod ? ensureProductCodLocation(prod) : null;
}

/**
 * Menyimpan seluruh daftar produk ke LocalStorage
 */
export function saveProducts(products) {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  window.dispatchEvent(new CustomEvent('productsUpdated', { detail: products }));
}

/**
 * Menambahkan produk baru ke LocalStorage (digunakan oleh jual.html)
 */
export function addProduct(productData) {
  const products = getProducts();
  const id = productData.id || `prd-${Date.now()}`;
  const now = new Date().toISOString();

  const newProduct = {
    ...productData,
    id,
    createdAt: productData.createdAt || now
  };

  const validatedProduct = ensureProductCodLocation(newProduct);
  products.unshift(validatedProduct);
  saveProducts(products);

  return validatedProduct;
}

/**
 * Mendapatkan daftar ID produk yang difavoritkan
 */
export function getFavorites() {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];
  } catch (e) {
    return [];
  }
}

/**
 * Cek apakah produk difavoritkan
 */
export function isFavorited(productId) {
  const favs = getFavorites();
  return favs.includes(productId);
}

/**
 * Menambahkan atau menghapus favorit (Toggle)
 */
export function toggleFavorite(productId) {
  const favs = getFavorites();
  const index = favs.indexOf(productId);
  let status = false;

  if (index > -1) {
    favs.splice(index, 1);
    status = false;
  } else {
    favs.push(productId);
    status = true;
  }

  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
  window.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: { productId, isFavorited: status } }));
  return status;
}

/**
 * Mendapatkan data pengguna yang sedang aktif
 */
export function getCurrentUser() {
  initStorage();
  return getAuthUiState().user;
}

/**
 * Mendapatkan semua tawaran
 */
function normalizeLegacyGuestOffers(offers) {
  let changed = false;
  const normalizedOffers = offers.map((offer) => {
    const normalizedOffer = { ...offer };
    const hasLegacyBuyer = normalizedOffer.buyerId === LEGACY_DEMO_USER_ID || normalizedOffer.buyerName === LEGACY_DEMO_USER_NAME;
    const hasLegacySeller = normalizedOffer.sellerId === LEGACY_DEMO_USER_ID || normalizedOffer.sellerName === LEGACY_DEMO_USER_NAME;

    if (hasLegacyBuyer) {
      normalizedOffer.buyerId = 'guest';
      normalizedOffer.buyerName = 'GUEST';
      normalizedOffer.buyerPhone = '';
      changed = true;
    }

    if (hasLegacySeller) {
      normalizedOffer.sellerId = 'guest';
      normalizedOffer.sellerName = 'GUEST';
      normalizedOffer.sellerPhone = '';
      changed = true;
    }

    if (typeof normalizedOffer.id === 'string' && normalizedOffer.id.includes(LEGACY_DEMO_USER_ID)) {
      normalizedOffer.id = normalizedOffer.id.replaceAll(LEGACY_DEMO_USER_ID, 'guest');
      changed = true;
    }

    return normalizedOffer;
  });

  if (changed) {
    localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(normalizedOffers));
  }

  return normalizedOffers;
}

export function getOffers() {
  initStorage();
  try {
    const offers = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFERS)) || [];
    return Array.isArray(offers) ? normalizeLegacyGuestOffers(offers) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Simpan daftar tawaran
 */
export function saveOffers(offers) {
  localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(offers));
  window.dispatchEvent(new CustomEvent('offersUpdated', { detail: offers }));
}

/**
 * Memperbarui status barang (tersedia | dalam_proses_cod | terjual)
 */
export function updateProductStatus(productId, newStatus) {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === productId);
  if (idx !== -1) {
    products[idx].status = newStatus;
    products[idx].updatedAt = new Date().toISOString();
    saveProducts(products);
    return products[idx];
  }
  return null;
}

/**
 * Menambahkan tawaran baru berstatus "menunggu"
 */
export function addOffer(offerData) {
  const offers = getOffers();
  const buyerId = offerData.buyerId || 'guest';
  const filtered = offers.filter(o => !(o.productId === offerData.productId && o.buyerId === buyerId));
  const newOffer = {
    id: offerData.id || `${offerData.productId}_${buyerId}`,
    productId: offerData.productId,
    productTitle: offerData.productTitle,
    productImage: offerData.productImage || 'assets/img/products/prd-001-1.jpg',
    sellerId: offerData.sellerId || 'usr-seller',
    sellerName: offerData.sellerName || 'Penjual',
    sellerPhone: offerData.sellerPhone || '628123456789',
    buyerId: buyerId,
    buyerName: offerData.buyerName || 'GUEST',
    buyerPhone: offerData.buyerPhone || '',
    hargaListing: offerData.hargaListing,
    hargaTawar: offerData.hargaTawar,
    catatan: offerData.catatan || '',
    status: 'menunggu',
    createdAt: offerData.createdAt || new Date().toISOString(),
    expiresAt: offerData.expiresAt || new Date(Date.now() + 3600000 * 48).toISOString()
  };

  filtered.unshift(newOffer);
  saveOffers(filtered);
  return newOffer;
}

/**
 * Update satu tawaran berdasarkan ID
 */
export function updateOffer(offerId, patch) {
  const offers = getOffers();
  const idx = offers.findIndex(o => o.id === offerId);
  if (idx !== -1) {
    offers[idx] = { ...offers[idx], ...patch, updatedAt: new Date().toISOString() };
    saveOffers(offers);

    if (patch.status === 'diterima') {
      updateProductStatus(offers[idx].productId, 'dalam_proses_cod');
    }

    return offers[idx];
  }
  return null;
}

/**
 * Hitung tawaran aktif / belum selesai untuk titik merah notifikasi
 */
export function getUnreadOffersCount() {
  const offers = getOffers();
  return offers.filter(o => o.status === 'menunggu' || o.status === 'ditawar_balik' || o.status === 'diterima').length;
}
