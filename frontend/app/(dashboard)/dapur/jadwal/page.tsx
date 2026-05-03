'use client';
import { useState, useEffect } from 'react';
import { PageHeader } from '../../../../components/layout/PageHeader';
import { StateCard } from '../../../../components/layout/StateCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Badge } from '../../../../components/ui/Badge';
import { CalendarDays, Save, Loader2 } from 'lucide-react';

export default function DapurJadwalPage() {
  const [menus, setMenus] = useState<any[]>([]);
  const [jadwal, setJadwal] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Default to today
  const [filterDate, setFilterDate] = useState(() => new Date().toISOString().split('T')[0]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resMenus, resJadwal] = await Promise.all([
        fetch('/api/proxy/menu'),
        fetch(`/api/proxy/menu/jadwal/list?tanggal=${filterDate}`)
      ]);
      const menusJson = await resMenus.json();
      const jadwalJson = await resJadwal.json();
      setMenus(Array.isArray(menusJson?.data) ? menusJson.data : (Array.isArray(menusJson) ? menusJson : []));
      setJadwal(Array.isArray(jadwalJson?.data) ? jadwalJson.data : (Array.isArray(jadwalJson) ? jadwalJson : []));
    } catch(e) {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [filterDate]);

  const [form, setForm] = useState({ tanggal: filterDate, menuId: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/proxy/menu/jadwal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Gagal simpan jadwal');
      setForm({...form, menuId: ''});
      loadData();
    } catch(e: any) { alert(e.message); }
    setSaving(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Jadwal Menu Aktif" 
        description="Tentukan menu apa yang akan digunakan / dikirim pada tanggal tertentu."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays size={18} className="text-primary"/> Set Menu Harian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-sm font-medium">Tanggal Operasional</label>
                 <Input type="date" value={form.tanggal} onChange={e=>setForm({...form, tanggal: e.target.value})} required/>
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium">Pilih Master Menu</label>
                 <select 
                   className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                   value={form.menuId} onChange={e=>setForm({...form, menuId: e.target.value})} required
                 >
                   <option value="">-- Pilih Menu --</option>
                   {menus?.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
                 </select>
               </div>
             </div>
             <Button type="submit" disabled={saving}>
               {saving ? 'Loading...' : <><Save size={16} className="mr-2"/> Aktifkan Menu</>}
             </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between mb-4">
           <h3 className="font-bold text-lg px-1">Menu Aktif Pada Tanggal Ini</h3>
           <Input type="date" className="w-auto h-8 text-xs" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}/>
        </div>
        
        {loading ? <StateCard icon={<Loader2 className="animate-spin"/>} title="Memuat" description=""/> : 
         jadwal.length === 0 ? <StateCard icon={<CalendarDays/>} title="Tidak Ada Menu" description="Belum ada menu yang diaktifkan untuk tanggal ini."/> :
         jadwal.map((j: any) => (
           <Card key={j.id} className="border-primary/20 bg-primary/5">
             <CardContent className="p-5 flex items-center justify-between">
               <div>
                 <Badge variant="default" className="mb-2">Menu Harian Aktif</Badge>
                 <div className="font-bold text-xl">{j.menu.nama}</div>
                 <div className="text-sm text-muted-foreground mt-1">{j.menu.deskripsi}</div>
                 <div className="text-xs text-muted-foreground mt-2">{j.menu.komponen?.length} komponen masakan.</div>
               </div>
             </CardContent>
           </Card>
         ))
        }
      </div>
    </div>
  );
}
