// PRELOVEDU — Storage & State Service (storage.js)
// Lapisan data terpisah untuk memudahkan transisi dari LocalStorage ke Firebase Firestore (Fase 2)

import { dummyProducts } from '../data/dummy-products.js';

const STORAGE_KEYS = {
  PRODUCTS: 'prelovedu_products',
  FAVORITES: 'prelovedu_favorites',
  OFFERS: 'prelovedu_offers',
  USER: 'prelovedu_user'
};

// Simulasi user mahasiswa yang aktif (Bisa diubah lewat halaman profil/login)
const DEFAULT_USER = {
  id: 'usr-maba-01',
  name: 'Zahra Putri',
  faculty: 'Informatika 2024',
  email: 'zahra@student.ac.id',
  isVerified: true,
  avatar: 'ZP',
  phone: '6281234567890'
};

/**
 * Inisialisasi data produk ke LocalStorage jika belum ada
 */
export function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(dummyProducts));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FAVORITES)) {
    // Inisialisasi awal dengan 2 produk favorit contoh
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(['prd-001', 'prd-003']));
  }
  if (!localStorage.getItem(STORAGE_KEYS.OFFERS)) {
    // Tawaran contoh untuk simulasi alur Tawar
    const initialOffers = [
      {
        id: 'prd-002_usr-maba-01',
        productId: 'prd-002',
        productTitle: 'Jas Laboratorium Kimia FMIPA Bahan Katun Tebal Size L',
        productImage: 'assets/img/products/lab-coat.svg',
        sellerId: 'usr-anisa',
        sellerName: 'Anisa Rahmawati',
        sellerPhone: '628987654321',
        buyerId: 'usr-maba-01',
        buyerName: 'Zahra Putri',
        hargaListing: 45000,
        hargaTawar: 40000,
        catatan: 'Bisa COD di depan gedung rektorat kak?',
        status: 'diterima', // menunggu | ditawar_balik | diterima | ditolak | kedaluwarsa
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        expiresAt: new Date(Date.now() + 3600000 * 44).toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(initialOffers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USER)) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
  }
}

/**
 * Mendapatkan seluruh daftar produk
 */
export function getProducts() {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS)) || dummyProducts;
  } catch (e) {
    return dummyProducts;
  }
}

/**
 * Mendapatkan produk berdasarkan ID
 */
export function getProductById(id) {
  const products = getProducts();
  return products.find(p => p.id === id) || null;
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
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)) || DEFAULT_USER;
  } catch (e) {
    return DEFAULT_USER;
  }
}

/**
 * Mendapatkan semua tawaran
 */
export function getOffers() {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFERS)) || [];
  } catch (e) {
    return [];
  }
}

/**
 * Hitung tawaran aktif / belum selesai untuk titik merah notifikasi
 */
export function getUnreadOffersCount() {
  const offers = getOffers();
  return offers.filter(o => o.status === 'menunggu' || o.status === 'ditawar_balik' || o.status === 'diterima').length;
}
