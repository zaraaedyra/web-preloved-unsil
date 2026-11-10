// PRELOVEDU — Komponen Logo SVG (logo.js)
// Sesuai spesifikasi Bagian 5.1: Wordmark PRELOVEDU dengan huruf "O" diganti 
// ikon heart daur ulang (3 panah melingkar berwarna merah siluet hati).

/**
 * Mengembalikan SVG Ikon Hati Daur Ulang (Recycled Heart Icon)
 * @param {string} color - Warna panah (default: #E5322D)
 * @param {number} size - Ukuran pixel
 */
export function getRecycledHeartSvg(color = '#E53935', size = 26) {
  return `
    <svg class="recycled-heart-icon" width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block; vertical-align:middle;" aria-hidden="true" focusable="false">
      <path d="M 10 28 C 6 22 5 17 7 13 C 10 7 18 7 24 15" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M 24 15 C 30 7 38 7 41 13 C 43 18 41 23 37 28" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M 37 28 C 33 34 28 38 24 41 C 20 38 14 33 10 28" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M 19 10 L 24 15 L 17 17 Z" fill="${color}" />
      <path d="M 40 22 L 37 29 L 33 23 Z" fill="${color}" />
      <path d="M 14 27 L 10 28 L 12 22 Z" fill="${color}" />
    </svg>
  `;
}

/**
 * Mengembalikan Full Wordmark PRELOVEDU
 * @param {Object} options - { textColor, heartColor, height }
 */
export function getWordmarkLogo({ textColor = '#2A2A2A', heartColor = '#E53935', height = 32 } = {}) {
  const iconSize = Math.round(height * 0.95);
  return `
    <span class="prelovedu-wordmark" style="display:inline-flex; align-items:center; font-family:var(--font-serif); font-weight:800; font-size:${height * 0.85}px; letter-spacing:-0.03em; color:${textColor}; line-height:1; user-select:none;">
      <span>PREL</span>
      <span style="display:inline-flex; align-items:center; margin:0 -1px;">${getRecycledHeartSvg(heartColor, iconSize)}</span>
      <span>VEDU</span>
    </span>
  `;
}

/**
 * Mengembalikan Favicon / App Icon bulat
 */
export function renderFavicon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="20" fill="#2A2A2A"/><g transform="translate(8,8)">${getRecycledHeartSvg('#E53935', 48)}</g></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
