# PRELOVEDU ♻️
> **Platform Marketplace & Katalog Preloved Khusus Mahasiswa Intra-Kampus**

PRELOVEDU adalah solusi cerdas untuk menghubungkan mahasiswa baru (maba) dengan kakak tingkat (kating) yang ingin menjual buku kuliah bekas, jas lab, jaket himpunan, kalkulator, dan perlengkapan perkuliahan berkualitas dengan harga ramah kantong.

Didesain dengan pendekatan visual **Playful-Editorial** (kombinasi warna lime segar, lilac pastel, dan charcoal pekat bergaris tebal) serta pengalaman pengguna modern khusus mobile dan desktop.

---

## 📌 Batasan Lingkup Proyek (PENTING)
1. **Bukan Toko Online Biasa:** Tidak ada payment gateway, rekening bersama, keranjang belanja, saldo/dompet digital, atau ongkos kirim.
2. **Sistem Tawar sebagai Gerbang Kontak:** Transaksi disepakati secara mandiri melalui WhatsApp dan COD (bertemu langsung di kampus) setelah pembeli mengajukan tawaran dan disetujui oleh penjual.
3. **Privasi Nomor Kontak:** Nomor WhatsApp tidak ditampilkan sembarangan di halaman publik untuk mencegah spam.

---

## 🗂️ Struktur Direktori

```text
prelovedu/
├── index.html                   # Halaman Utama (Beranda & Landing Page)
├── pages/                       # Halaman-halaman pendukung
│   ├── detail.html              # Detail Produk & Formulir Tawar
│   ├── favorit.html             # Daftar Produk Tersimpan
│   ├── jual.html                # Stepper Pasang Iklan Barang
│   ├── tawaran.html             # Manajemen Tawaran Masuk & Terkirim
│   ├── profil.html              # Profil Pengguna & Verifikasi KTM
│   └── login.html               # Masuk / Daftar Akun Mahasiswa
├── assets/
│   ├── css/
│   │   ├── tokens.css           # Variabel warna, tipografi, radius & shadow
│   │   ├── base.css             # Reset CSS, utilitas dasar, font loading
│   │   ├── components.css       # Komponen UI (navbar, kartu, tombol, badge, modal)
│   │   └── pages.css            # Gaya khusus halaman & layout responsif
│   ├── js/
│   │   ├── data/
│   │   │   └── dummy-products.js# 24 data produk contoh realistis mahasiswa
│   │   ├── services/
│   │   │   └── storage.js       # Manajemen state lokal (localStorage)
│   │   ├── components/
│   │   │   ├── logo.js          # Wordmark PRELOVEDU + SVG Heart Daur Ulang
│   │   │   ├── icons.js         # Koleksi ikon SVG Lucide
│   │   │   └── product-card.js  # Generator kartu produk seragam
│   │   └── main.js              # Interaksi halaman utama
│   └── img/                     # Aset gambar & ilustrasi
├── firebase.json                # Konfigurasi hosting Firebase
├── firestore.rules              # Aturan keamanan database Firestore
├── config.example.js            # Contoh konfigurasi Firebase & Cloudinary
├── .gitignore                   # Berkas yang diabaikan Git
└── README.md                    # Dokumentasi proyek
```

---

## 🚀 Cara Menjalankan Proyek di Komputer Lokal

Karena proyek ini menggunakan standar modern **ES Modules** tanpa bundler rumit (tanpa perlu compile Webpack/Vite), Anda hanya butuh web server statis sederhana:

### Opsi A (VS Code Live Server — Termudah untuk Pemula)
1. Buka folder ini di **VS Code**.
2. Klik kanan pada berkas `index.html`.
3. Pilih **"Open with Live Server"**.
4. Website akan otomatis terbuka di browser pada alamat `http://127.0.0.1:5500`.

### Opsi B (Lewat Terminal / Python)
Jalankan perintah berikut di terminal:
```bash
python3 -m http.server 8000
```
Lalu buka browser Anda dan akses:
```
http://localhost:8000
```

---

## 🎨 Identitas Visual & Desain
- **Palet Warna:**
  - `--lime` (`#C9F26B`): Aksen berani, tombol aksi utama, banner hero.
  - `--lilac` (`#E9C6EA`): Latar kartu produk unggulan, pill aktif, aksen navigasi.
  - `--ink` (`#2A2A2A`): Garis outline tebal 2.5px, teks utama, bottom nav bar.
  - `--paper` (`#F1F1EF`): Latar belakang halaman yang ramah di mata.
  - `--heart-red` (`#E5322D`): Aksen hati daur ulang pada logo dan tombol suka/favorit.
- **Tipografi:** Kombinasi anggun serif (*Fraunces*) untuk judul/harga dan sans-serif modern (*Plus Jakarta Sans*) untuk kenyamanan membaca.

---

## ⚙️ Persiapan Integrasi Firebase (Untuk Fase Selanjutnya)
1. Buka [Firebase Console](https://console.firebase.google.com/).
2. Buat proyek baru gratis (Paket Spark).
3. Aktifkan **Authentication** (Metode Email/Password).
4. Aktifkan **Cloud Firestore** dalam mode pengujian / terapkan aturan `firestore.rules`.
5. Salin `config.example.js` menjadi `config.js` dan isi kredensial proyek Anda.
