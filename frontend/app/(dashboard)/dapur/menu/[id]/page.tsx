'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { PageHeader } from '../../../../../components/layout/PageHeader';
import { StateCard } from '../../../../../components/layout/StateCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import { Badge } from '../../../../../components/ui/Badge';
import { Plus, ArrowLeft, Loader2, Trash2 } from 'lucide-react';

export default function KomponenMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [menu, setMenu] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/proxy/menu/${id}`);
      if (res.ok) {
        const json = await res.json();
        setMenu(json?.data || json);
      }
    } catch(e) {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [id]);

  const [form, setForm] = useState({ nama: '', deskripsi: '', porsi: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/proxy/menu/${id}/komponen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Gagal menyimpan komponen');
      setForm({ nama: '', deskripsi: '', porsi: '' });
      loadData();
    } catch(e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (komponenId: string) => {
    if (!confirm('Hapus komponen?')) return;
    try {
      await fetch(`/api/proxy/menu/komponen/${komponenId}`, { method: 'DELETE' });
      loadData();
    } catch(e) {}
  };

  if (loading) return <StateCard icon={<Loader2 className="animate-spin text-primary" size={32}/>} title="Memuat Data Menu" description=""/>;
  if (!menu) return <StateCard icon={<ArrowLeft size={32}/>} title="Data Tidak Ditemukan" description=""/>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/dapur/menu">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <span className="text-sm font-medium text-muted-foreground mr-auto">Kembali</span>
      </div>

      <PageHeader 
        title={`Komposisi: ${menu.nama}`} 
        description={menu.deskripsi || 'Atur detail lauk, sayur, buah, atau susu.'}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus size={18} className="text-primary"/> Tambah Komponen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div className="space-y-2">
                 <label className="text-sm font-medium">Nama</label>
                 <Input placeholder="Misal: Nasi Putih" value={form.nama} onChange={e=>setForm({...form, nama: e.target.value})} required/>
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium">Porsi</label>
                 <Input placeholder="Misal: 150 gr" value={form.porsi} onChange={e=>setForm({...form, porsi: e.target.value})} />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium">Deskripsi</label>
                 <Input placeholder="(Opsional)" value={form.deskripsi} onChange={e=>setForm({...form, deskripsi: e.target.value})} />
               </div>
             </div>
             <Button type="submit" disabled={saving}>
               {saving ? 'Menyimpan...' : 'Simpan Komponen'}
             </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="font-bold text-lg px-1">Daftar Komponen</h3>
        {menu.komponen?.length === 0 && <p className="text-muted-foreground px-1 text-sm">Belum ada komponen ditambahkan.</p>}
        {menu.komponen?.map((k: any) => (
          <Card key={k.id}>
            <CardContent className="p-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-foreground flex items-center gap-2">
                  {k.nama} 
                  {k.porsi && <Badge variant="secondary">{k.porsi}</Badge>}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{k.deskripsi}</div>
              </div>
              <Button variant="destructive" size="icon" onClick={() => handleDelete(k.id)}>
                <Trash2 size={16}/>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
