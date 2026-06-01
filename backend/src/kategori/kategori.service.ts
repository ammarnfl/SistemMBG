import { Injectable } from '@nestjs/common';

/**
 * Daftar kategori keluhan feedback yang tersedia.
 * Multi-label: satu feedback bisa masuk ke lebih dari satu kategori.
 */
export const KATEGORI_LIST = [
  'RASA',
  'PORSI',
  'KUALITAS',
  'KEBERSIHAN',
  'DISTRIBUSI',
  'LAINNYA',
] as const;

export type KategoriLabel = (typeof KATEGORI_LIST)[number];

/**
 * Dictionary kata kunci per kategori.
 * Pencocokan dilakukan terhadap teks yang sudah di-lowercase.
 */
export const KATEGORI_KEYWORDS: Record<string, string[]> = {
  RASA: [
    'hambar', 'tawar', 'asin', 'pedas', 'manis', 'pahit', 'bumbu',
    'rasa', 'gurih', 'kecut', 'asem', 'asam', 'enak',
  ],
  PORSI: [
    'porsi', 'sedikit', 'dikit', 'kurang', 'banyak', 'kecil',
    'kenyang', 'nambah',
  ],
  KUALITAS: [
    'basi', 'bau', 'dingin', 'keras', 'lembek', 'mentah', 'amis',
    'apek', 'busuk', 'alot', 'belum matang', 'kurang matang',
    'fresh', 'segar',
  ],
  KEBERSIHAN: [
    'kotor', 'pasir', 'rambut', 'bocor', 'wadah', 'jorok', 'najis',
  ],
  DISTRIBUSI: [
    'telat', 'terlambat', 'lama', 'jam istirahat', 'belum datang',
    'belum sampai', 'distribusi',
  ],
};

/**
 * Kategorisasi feedback berdasarkan pencocokan kata kunci.
 *
 * - text null/kosong          → []
 * - cocok >=1 keyword         → array kategori unik yang cocok
 * - text ada tapi tak ada cocok → ['LAINNYA']
 */
export function categorize(text: string | null | undefined): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const lower = text.toLowerCase();
  const matched = new Set<string>();

  for (const [kategori, keywords] of Object.entries(KATEGORI_KEYWORDS)) {
    for (const keyword of keywords) {
      // Untuk keyword multi-kata, gunakan includes (frasa harus muncul utuh)
      // Untuk keyword satu kata, gunakan word boundary agar tidak match substring
      let isMatch: boolean;
      if (keyword.includes(' ')) {
        isMatch = lower.includes(keyword);
      } else {
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        isMatch = regex.test(lower);
      }
      if (isMatch) {
        matched.add(kategori);
        break; // satu keyword cukup untuk kategori ini
      }
    }
  }

  if (matched.size === 0) {
    return ['LAINNYA'];
  }

  return Array.from(matched);
}

@Injectable()
export class KategoriService {
  /**
   * Wrapper method yang bisa di-inject sebagai service.
   * Memanggil fungsi murni `categorize()`.
   */
  categorize(text: string | null | undefined): string[] {
    return categorize(text);
  }
}
