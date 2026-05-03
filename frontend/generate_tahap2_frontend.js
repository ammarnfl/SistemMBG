const fs = require('fs');
const path = require('path');

const writeCode = (filepath, content) => {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filepath, content.trim() + '\n', 'utf8');
};

writeCode('./app/(dashboard)/admin/page.tsx', `
import Link from 'next/link';

export default function AdminDashboardPage() {
  const menu = [
    { title: 'Manajemen User', desc: 'Kelola admin, dapur, guru, penerima manfaat', href: '/admin/users' },
    { title: 'Manajemen Dapur', desc: 'Kelola data dapur penyedia makanan', href: '/admin/dapur' },
    { title: 'Manajemen Sekolah', desc: 'Kelola data sekolah dan mapping dapur', href: '/admin/sekolah' },
    { title: 'Manajemen Kelas', desc: 'Kelola data kelas per sekolah', href: '/admin/kelas' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold text-neutral-800 tracking-tight">Dashboard Admin</h2>
        <p className="text-neutral-500 mt-2 max-w-sm">Selamat datang di panel kontrol utama Sistem Evaluasi Layanan MBG.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {menu.map((m, i) => (
          <Link href={m.href} key={i}>
            <div className="p-5 rounded-2xl bg-white border border-neutral-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full group">
              <h3 className="font-semibold text-lg text-neutral-800 group-hover:text-blue-600 transition-colors">{m.title}</h3>
              <p className="text-sm text-neutral-500 mt-1 flex-1">{m.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
`);


writeCode('./app/(dashboard)/admin/users/page.tsx', `
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '../../../lib/api-client';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/proxy/admin-users');
      if (!res.ok) throw new Error('Gagal mengambil data user');
      const data = await res.json();
      setUsers(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'GURU' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/proxy/admin-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Gagal simpan user');
      setForm({ name: '', email: '', password: '', role: 'GURU' });
      loadData();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-blue-600 font-medium hover:underline">← Kembali</Link>
        <h2 className="text-xl font-bold text-neutral-800">Manajemen User</h2>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100">
        <h3 className="font-semibold mb-3">Tambah User Baru</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="w-full p-2 border rounded-lg" placeholder="Nama" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required/>
          <input className="w-full p-2 border rounded-lg" placeholder="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required/>
          <input className="w-full p-2 border rounded-lg" placeholder="Password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required/>
          <select className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" value={form.role} onChange={e => setForm({...form, role: e.target.value})} required>
            <option value="ADMIN">ADMIN</option>
            <option value="TIM_DAPUR">TIM_DAPUR</option>
            <option value="GURU">GURU</option>
            <option value="PENERIMA_MANFAAT">PENERIMA_MANFAAT</option>
          </select>
          <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white rounded-lg p-2 font-medium hover:bg-blue-700 transition disabled:opacity-50">
            {saving ? 'Menyimpan...' : 'Simpan User'}
          </button>
        </form>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100 overflow-x-auto">
        {loading ? <p className="text-neutral-500">Loading...</p> : error ? <p className="text-red-500">{error}</p> : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-neutral-50">
                <th className="p-3 font-medium text-sm">Nama</th>
                <th className="p-3 font-medium text-sm">Role</th>
                <th className="p-3 font-medium text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-neutral-50">
                  <td className="p-3 text-sm">
                    <div className="font-medium text-neutral-800">{u.name}</div>
                    <div className="text-xs text-neutral-500">{u.email}</div>
                  </td>
                  <td className="p-3 text-sm">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">{u.role}</span>
                  </td>
                  <td className="p-3 text-sm">
                    {u.isActive ? <span className="text-green-600 font-semibold text-xs">Aktif</span> : <span className="text-red-600 font-semibold text-xs">Nonaktif</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
`);

writeCode('./app/(dashboard)/admin/dapur/page.tsx', `
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDapurPage() {
  const [dapur, setDapur] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/proxy/dapur');
      if (!res.ok) throw new Error('Gagal mengambil data dapur');
      const data = await res.json();
      setDapur(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const [form, setForm] = useState({ nama: '', alamat: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/proxy/dapur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Gagal simpan dapur');
      setForm({ nama: '', alamat: '' });
      loadData();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-blue-600 font-medium hover:underline">← Kembali</Link>
        <h2 className="text-xl font-bold text-neutral-800">Manajemen Dapur</h2>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100">
        <h3 className="font-semibold mb-3">Tambah Dapur Baru</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Nama Dapur" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} required/>
          <input className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Alamat (opsional)" value={form.alamat} onChange={e => setForm({...form, alamat: e.target.value})}/>
          <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white rounded-lg p-2 font-medium hover:bg-blue-700 transition disabled:opacity-50">
            {saving ? 'Menyimpan...' : 'Simpan Dapur'}
          </button>
        </form>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100">
        <h3 className="font-semibold mb-3">Daftar Dapur</h3>
        {loading ? <p className="text-neutral-500">Loading...</p> : error ? <p className="text-red-500">{error}</p> : (
          <ul className="space-y-2">
            {dapur.map((d, i) => (
              <li key={i} className="p-3 border rounded-xl hover:bg-neutral-50 transition">
                <div className="font-medium">{d.nama}</div>
                {d.alamat && <div className="text-sm text-neutral-500">{d.alamat}</div>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
`);

writeCode('./app/(dashboard)/admin/sekolah/page.tsx', `
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminSekolahPage() {
  const [sekolah, setSekolah] = useState<any[]>([]);
  const [dapur, setDapur] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resSekolah, resDapur] = await Promise.all([
        fetch('/api/proxy/sekolah'),
        fetch('/api/proxy/dapur')
      ]);
      setSekolah(await resSekolah.json());
      setDapur(await resDapur.json());
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const [form, setForm] = useState({ nama: '', alamat: '', dapurId: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = { nama: form.nama, alamat: form.alamat };
      if (form.dapurId) payload.dapurId = form.dapurId;
      
      const res = await fetch('/api/proxy/sekolah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Gagal simpan sekolah');
      setForm({ nama: '', alamat: '', dapurId: '' });
      loadData();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-blue-600 font-medium hover:underline">← Kembali</Link>
        <h2 className="text-xl font-bold text-neutral-800">Manajemen Sekolah</h2>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100">
        <h3 className="font-semibold mb-3">Tambah Sekolah Baru / Mapping Dapur</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="w-full p-2 border rounded-lg" placeholder="Nama Sekolah" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} required/>
          <input className="w-full p-2 border rounded-lg" placeholder="Alamat (opsional)" value={form.alamat} onChange={e => setForm({...form, alamat: e.target.value})}/>
          <select className="w-full p-2 border rounded-lg" value={form.dapurId} onChange={e => setForm({...form, dapurId: e.target.value})}>
            <option value="">-- Pilih Dapur Supplier (Opsional) --</option>
            {dapur.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
          </select>
          <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white rounded-lg p-2 font-medium hover:bg-blue-700 transition">
            {saving ? 'Menyimpan...' : 'Simpan Sekolah'}
          </button>
        </form>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100">
         <h3 className="font-semibold mb-3">Daftar Sekolah</h3>
         {loading ? <p>Loading...</p> : (
           <ul className="space-y-2">
             {sekolah.map((s, i) => (
               <li key={i} className="p-3 border rounded-xl flex justify-between items-start">
                 <div>
                   <div className="font-medium text-neutral-800">{s.nama}</div>
                   <div className="text-sm text-neutral-500">{s.alamat || '-'}</div>
                 </div>
                 <div className="text-xs font-medium px-2 py-1 rounded bg-orange-100 text-orange-800">
                    Dapur: {s.dapur ? s.dapur.nama : 'Belum Assign'}
                 </div>
               </li>
             ))}
           </ul>
         )}
      </div>
    </div>
  );
}
`);

writeCode('./app/(dashboard)/admin/kelas/page.tsx', `
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminKelasPage() {
  const [kelas, setKelas] = useState<any[]>([]);
  const [sekolah, setSekolah] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resKelas, resSekolah] = await Promise.all([
        fetch('/api/proxy/kelas'),
        fetch('/api/proxy/sekolah')
      ]);
      setKelas(await resKelas.json());
      setSekolah(await resSekolah.json());
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const [form, setForm] = useState({ nama: '', sekolahId: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/proxy/kelas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Gagal simpan kelas');
      setForm({ nama: '', sekolahId: '' });
      loadData();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-blue-600 font-medium hover:underline">← Kembali</Link>
        <h2 className="text-xl font-bold text-neutral-800">Manajemen Kelas</h2>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100">
        <h3 className="font-semibold mb-3">Tambah Kelas Baru</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <select className="w-full p-2 border rounded-lg" value={form.sekolahId} onChange={e => setForm({...form, sekolahId: e.target.value})} required>
            <option value="">-- Pilih Sekolah --</option>
            {sekolah.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
          </select>
          <input className="w-full p-2 border rounded-lg" placeholder="Nama Kelas (contoh: 1A)" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} required/>
          <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white rounded-lg p-2 font-medium hover:bg-blue-700 transition">
            {saving ? 'Menyimpan...' : 'Simpan Kelas'}
          </button>
        </form>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100">
         <h3 className="font-semibold mb-3">Daftar Kelas</h3>
         {loading ? <p>Loading...</p> : (
           <ul className="space-y-2">
             {kelas.map((k, i) => (
               <li key={i} className="p-3 border rounded-xl flex justify-between items-center">
                 <div className="font-medium text-neutral-800">{k.nama}</div>
                 <div className="text-xs font-medium px-2 py-1 rounded bg-blue-50 text-blue-800">
                    {k.sekolah?.nama}
                 </div>
               </li>
             ))}
           </ul>
         )}
      </div>
    </div>
  );
}
`);

console.log("Frontend Stage 2 pages generated successfully.");
