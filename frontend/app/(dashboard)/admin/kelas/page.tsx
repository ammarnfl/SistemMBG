'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '../../../../components/layout/PageHeader';
import { StateCard } from '../../../../components/layout/StateCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Badge } from '../../../../components/ui/Badge';
import { ArrowLeft, Plus, LayoutGrid, Loader2 } from 'lucide-react';

export default function AdminKelasPage() {
  const [kelas, setKelas] = useState<any[]>([]);
  const [sekolah, setSekolah] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [resKelas, resSekolah] = await Promise.all([
        fetch('/api/proxy/kelas'),
        fetch('/api/proxy/sekolah')
      ]);
      const dataKelas = await resKelas.json();
      const dataSekolah = await resSekolah.json();
      setKelas(dataKelas.data || []);
      setSekolah(dataSekolah.data || []);
    } catch (e: any) {
      setError(e.message || 'Terjadi kesalahan sistem');
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <span className="text-sm font-medium text-muted-foreground">Kembali</span>
      </div>

      <PageHeader 
        title="Manajemen Kelas / Grup" 
        description="Kelola daftar kelas dan kelompok di masing-masing sekolah penerima manfaat."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus size={18} className="text-primary" /> Tambah Kelas Baru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Asal Sekolah</label>
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                  value={form.sekolahId} onChange={e => setForm({...form, sekolahId: e.target.value})} required
                >
                  <option value="">-- Pilih Sekolah --</option>
                  {sekolah.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Kelas / Grup</label>
                <Input placeholder="Contoh: 1A, atau Kelompok A" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} required/>
              </div>
            </div>
            <div className="pt-2">
              <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                {saving ? <><Loader2 size={16} className="mr-2 animate-spin" /> Menyimpan...</> : 'Simpan Kelas'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-bold text-lg text-foreground px-1">Daftar Kelas</h3>
        {loading ? (
          <StateCard icon={<Loader2 size={32} className="animate-spin" />} title="Memuat Data" description="Mohon tunggu sebentar..." />
        ) : error ? (
          <StateCard icon={<LayoutGrid size={32} />} title="Gagal Memuat" description={error} action={<Button variant="outline" onClick={loadData}>Coba Lagi</Button>} />
        ) : kelas.length === 0 ? (
          <StateCard icon={<LayoutGrid size={32} />} title="Belum Ada Data" description="Silahkan tambah data kelas baru di atas." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kelas.map((k, i) => (
              <Card key={i} className="flex flex-col">
                <CardContent className="p-4 flex-1 flex items-center justify-between gap-2">
                  <div className="font-semibold text-foreground text-lg">{k.nama}</div>
                  <Badge variant="secondary" className="text-center">{k.sekolah?.nama || 'Tanpa Sekolah'}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
