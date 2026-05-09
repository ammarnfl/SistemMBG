const BASE = 'http://localhost:3001';
async function api(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  let json = null;
  try { json = await res.json(); } catch (_) {}
  return { status: res.status, json };
}

const admin = await api('POST', '/auth/login', { email: 'admin@example.com', password: 'Password123!' });
const adminToken = admin.json?.data?.accessToken;
const guru = await api('POST', '/auth/login', { email: 'guru@example.com', password: 'Password123!' });
const guruToken = guru.json?.data?.accessToken;
const dapur = await api('POST', '/auth/login', { email: 'dapur@example.com', password: 'Password123!' });
const dapurToken = dapur.json?.data?.accessToken;

// Get first sekolah and dapur
const sekolahList = await api('GET', '/sekolah', null, adminToken);
const sekolah = sekolahList.json?.data?.[0];
const dapurList = await api('GET', '/dapur', null, adminToken);
const dapurItem = dapurList.json?.data?.[0];
console.log('Sekolah:', sekolah?.id, sekolah?.nama);
console.log('Dapur:', dapurItem?.id, dapurItem?.nama);

// --- Test PATCH sekolah (bug 1 repro) ---
const patchR = await api('PATCH', `/sekolah/${sekolah?.id}`, { dapurId: dapurItem?.id }, adminToken);
console.log('\nPATCH /sekolah (only dapurId) status:', patchR.status);
console.log(JSON.stringify(patchR.json, null, 2).substring(0, 300));

// Also try without any fields
const patchR2 = await api('PATCH', `/sekolah/${sekolah?.id}`, { nama: 'Test Update' }, adminToken);
console.log('\nPATCH /sekolah (only nama) status:', patchR2.status);
console.log(JSON.stringify(patchR2.json, null, 2).substring(0, 300));

// --- Test Guru konfirmasi ---
// List distribusi for guru's sekolah
const distList = await api('GET', '/distribusi/sekolah-saya', null, guruToken);
const dist = distList.json?.data?.[0];
console.log('\nGuru distribusi[0]:', dist?.id, 'status:', dist?.status);

// Confirm it
if (dist?.id) {
  const konfR = await api('PATCH', `/distribusi/${dist.id}/konfirmasi`, {
    status: 'DITERIMA', catatanGuru: 'OK'
  }, guruToken);
  console.log('\nPATCH konfirmasi status:', konfR.status);
  console.log(JSON.stringify(konfR.json, null, 2).substring(0, 400));
}
