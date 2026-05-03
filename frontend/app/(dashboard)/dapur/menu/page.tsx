'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '../../../../components/layout/PageHeader';
import { StateCard } from '../../../../components/layout/StateCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Badge } from '../../../../components/ui/Badge';
import { Plus, BookOpen, Loader2 } from 'lucide-react';

export default function DapurMenuPage() {
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/proxy/menu');
      if (!res.ok) throw new Error('Gagal memuat menu');
      const json = await res.json();
      setMenus(Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const [form, setForm] = useState({ nama: '', deskripsi: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/proxy/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Gagal menyimpan menu');
      setForm({ nama: '', deskripsi: '' });
      loadData();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Daftar Menu Master" 
        description="Kelola jenis menu MBG yang akan didistribusikan."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus size={18} className="text-primary" /> Tambah Menu Baru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Menu</label>
                <Input placeholder="Contoh: Nasi Ayam Rica" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} required/>
              </div>
              <div className="space-y-2 relative">
                <label className="text-sm font-medium">Deskripsi (Opsional)</label>
                <Input placeholder="Penjelasan singkat menu..." value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})}/>
              </div>
            </div>
            <div className="pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? <><Loader2 size={16} className="mr-2 animate-spin" /> Menyimpan...</> : 'Simpan Menu'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-bold text-lg px-1">Katalog Menu</h3>
        {loading ? (
          <StateCard icon={<Loader2 className="animate-spin" size={32} />} title="Memuat" description="Silakan tunggu..." />
        ) : error ? (
          <StateCard icon={<BookOpen size={32} />} title="Error" description={error} action={<Button variant="outline" onClick={loadData}>Coba Lagi</Button>} />
        ) : menus.length === 0 ? (
          <StateCard icon={<BookOpen size={32} />} title="Belum Ada Menu" description="Daftar menu masih kosong." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {menus.map((m, i) => (
              <Card key={i} className="flex flex-col">
                <CardContent className="p-4 flex-1 flex flex-col gap-3 justify-between">
                  <div>
                    <div className="font-bold text-lg">{m.nama}</div>
                    <div className="text-sm text-muted-foreground my-1">{m.deskripsi || 'Tidak ada deskripsi'}</div>
                    <Badge variant="outline" className="mt-2">
                      {m.komponen ? m.komponen.length : 0} Komponen
                    </Badge>
                  </div>
                  <div className="mt-4 border-t pt-3">
                    <Link href={`/dapur/menu/${m.id}`} className="w-full block">
                      <Button variant="outline" className="w-full">Lihat Komposisi &rarr;</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
