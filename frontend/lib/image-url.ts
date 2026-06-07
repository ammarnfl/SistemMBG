/**
 * Resolusi URL gambar yang aman untuk localhost MAUPUN tunnel (Cloudflare).
 *
 * Masalah lama: backend menyimpan URL absolut ber-host (mis.
 * `http://localhost:3001/uploads/x.png` atau `https://<tunnel>.trycloudflare.com/uploads/x.png`).
 * Host ini "di-bake" ke DB sehingga:
 *   - di tunnel, browser remote tidak bisa menjangkau `localhost:3001`;
 *   - quick tunnel berganti domain acak tiap restart → URL lama mati (404).
 *
 * Solusi: SELALU layani gambar lewat proxy same-origin frontend
 * (`/api/proxy/...`). Browser cukup bicara ke satu origin (frontend); proxy
 * meneruskan ke backend di sisi server. Host apa pun yang terlanjur tersimpan
 * diabaikan — kita hanya ambil bagian path `/uploads/...`.
 */
export function resolveImgUrl(raw?: string | null): string {
  if (!raw) return '';

  const value = raw.trim();
  if (!value) return '';

  // Sudah diproksikan.
  if (value.startsWith('/api/proxy/')) return value;

  // Apa pun yang menunjuk ke file upload → proksikan, abaikan host (mungkin basi).
  const idx = value.indexOf('/uploads/');
  if (idx !== -1) return `/api/proxy${value.slice(idx)}`;

  // Path relatif backend lain.
  if (value.startsWith('/')) return `/api/proxy${value}`;

  // URL absolut eksternal yang bukan milik kita (mis. placeholder seed) → apa adanya.
  return value;
}
