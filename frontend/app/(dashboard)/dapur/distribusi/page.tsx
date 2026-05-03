'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '../../../../components/layout/PageHeader';
import { StateCard } from '../../../../components/layout/StateCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Badge } from '../../../../components/ui/Badge';
import { Truck, Upload, Plus, FileSpreadsheet, Send, Search } from 'lucide-react';

export default function DapurDistribusiPage() {
  const [distribusi, setDistribusi] = useState<any[]>([]);
  const [sekolah, setSekolah] = useState<any[]>([]);
  const [dapur, setDapur] = useState<any[]>([]);
  const [jadwal, setJadwal] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'SINGLE' | 'BATCH'>('SINGLE');

  const [filterDate, setFilterDate] = useState(() => new Date().toISOString().split('T')[0]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resDist, resSekolah, resDapur, resJadwal] = await Promise.all([
        fetch(`/api/proxy/distribusi?tanggal=${filterDate}`),
        fetch('/api/proxy/sekolah'),
        fetch('/api/proxy/dapur'),
        fetch(`/api/proxy/menu/jadwal/list?tanggal=${filterDate}`)
      ]);
      const distJson = await resDist.json();
      const sekolahJson = await resSekolah.json();
      const dapurJson = await resDapur.json();
      const jadwalJson = await resJadwal.json();
      
      setDistribusi(Array.isArray(distJson?.data) ? distJson.data : (Array.isArray(distJson) ? distJson : []));
      setSekolah(Array.isArray(sekolahJson?.data) ? sekolahJson.data : (Array.isArray(sekolahJson) ? sekolahJson : []));
      setDapur(Array.isArray(dapurJson?.data) ? dapurJson.data : (Array.isArray(dapurJson) ? dapurJson : []));
      setJadwal(Array.isArray(jadwalJson?.data) ? jadwalJson.data : (Array.isArray(jadwalJson) ? jadwalJson : []));
    } catch(e) {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [filterDate]);

  // Form Single
  const [form, setForm] = useState({ tanggal: filterDate, sekolahId: '', menuId: '', jumlahPorsi: '', catatanDapur: '' });
  const [saving, setSaving] = useState(false);

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Dapur ID di-handle otomatis oleh backend
      const payload: any = {
        tanggal: form.tanggal,
        sekolahId: form.sekolahId,
        jumlahPorsi: parseInt(form.jumlahPorsi),
        catatanDapur: form.catatanDapur
      };
      if (form.menuId) payload.menuId = form.menuId;

      const res = await fetch('/api/proxy/distribusi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if(!res.ok) throw new Error('Gagal simpan distribusi');
      setForm({...form, sekolahId: '', jumlahPorsi: '', catatanDapur: '', menuId: ''});
      loadData();
    } catch(e: any) { alert(e.message); }
    setSaving(false);
  };

  // CSV Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(!file) return;

    setSaving(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim() !== '');
        
        // Asumsi format: Tanggal(YYYY-MM-DD),ID Sekolah,ID Menu,Jumlah Porsi,Catatan
        // Abaikan header (baris 1)
        const items = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',');
          if (cols.length >= 4) {
            const payload: any = {
              tanggal: cols[0].trim(),
              sekolahId: cols[1].trim(),
              jumlahPorsi: parseInt(cols[3].trim()),
              catatanDapur: cols[4] ? cols[4].trim() : ''
            };
            const menuId = cols[2].trim();
            if (menuId) payload.menuId = menuId;
            items.push(payload);
          }
        }

        const res = await fetch('/api/proxy/distribusi/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items })
        });
        if(!res.ok) throw new Error('Gagal batch upload');
        alert('Berhasil upload ' + items.length + ' data.');
        loadData();
      } catch(e: any) {
        alert(e.message);
      } finally {
        setSaving(false);
        // reset input
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/proxy/distribusi/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      loadData();
    } catch(e) {}
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Distribusi Makanan" 
        description="Jadwalkan pengiriman dan perbarui status keberangkatan."
      />

      <Card>
        <CardHeader className="pb-2 border-b">
          <div className="flex gap-4">
             <button onClick={() => setTab('SINGLE')} className={`pb-2 text-sm font-semibold border-b-2 ${tab==='SINGLE'?'border-primary text-primary':'border-transparent text-muted-foreground'}`}>
               <div className="flex items-center gap-1"><Plus size={16}/> Input Manual</div>
             </button>
             <button onClick={() => setTab('BATCH')} className={`pb-2 text-sm font-semibold border-b-2 ${tab==='BATCH'?'border-primary text-primary':'border-transparent text-muted-foreground'}`}>
               <div className="flex items-center gap-1"><FileSpreadsheet size={16}/> Upload CSV</div>
             </button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {tab === 'SINGLE' ? (
            <form onSubmit={handleSingleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tanggal</label>
                  <Input type="date" value={form.tanggal} onChange={e=>setForm({...form, tanggal: e.target.value})} required/>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Menu (Dari Jadwal Aktif)</label>
                  <select className="flex h-9 w-full border rounded-md px-3 text-sm" value={form.menuId} onChange={e=>setForm({...form, menuId: e.target.value})}>
                    <option value="">-- Pilih Menu (Opsional) --</option>
                    {jadwal.map(j=><option key={j.menu?.id} value={j.menu?.id}>{j.menu?.nama}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sekolah Tujuan</label>
                  <select className="flex h-9 w-full border rounded-md px-3 text-sm" value={form.sekolahId} onChange={e=>setForm({...form, sekolahId: e.target.value})} required>
                    <option value="">-- Sekolah --</option>
                    {sekolah.map(s=><option key={s.id} value={s.id}>{s.nama}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Jumlah Porsi</label>
                  <Input type="number" min="1" value={form.jumlahPorsi} onChange={e=>setForm({...form, jumlahPorsi: e.target.value})} required/>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium">Catatan (Staf / Pengemudi)</label>
                  <Input value={form.catatanDapur} onChange={e=>setForm({...form, catatanDapur: e.target.value})} placeholder="Contoh: Diantar oleh Budi jam 10.00"/>
                </div>
              </div>
              <Button type="submit" disabled={saving}>{saving?'Loading...':'Simpan Distribusi'}</Button>
            </form>
          ) : (
            <div className="space-y-4 border-2 border-dashed rounded-lg p-6 text-center">
              <Upload size={32} className="mx-auto text-muted-foreground mb-4"/>
              <h3 className="font-semibold text-lg text-foreground">Format CSV Batch Upload</h3>
              <p className="text-sm text-muted-foreground">Silakan download template CSV di bawah ini dan isi dengan data yang benar sebelum di-upload.<br/>(ID Menu bersifat opsional, kosongkan jika tidak ada)</p>
              
              <div className="flex justify-center gap-4 mt-4">
                 <Button variant="outline" type="button" onClick={() => {
                   const csvContent = "data:text/csv;charset=utf-8,Tanggal,ID Sekolah,ID Menu,Jumlah Porsi,Catatan\n2026-05-01,SEKOLAH_ID,MENU_ID,50,Diantar Pak Budi";
                   const encodedUri = encodeURI(csvContent);
                   const link = document.createElement("a");
                   link.setAttribute("href", encodedUri);
                   link.setAttribute("download", "template_distribusi.csv");
                   document.body.appendChild(link);
                   link.click();
                   document.body.removeChild(link);
                 }}>
                   Download Template CSV
                 </Button>
                 
                 <div className="relative inline-block">
                   <input type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                   <Button disabled={saving}>{saving?'Uploading...':'Pilih File CSV & Upload'}</Button>
                 </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded border">
           <h3 className="font-bold text-lg px-1 flex-1">Status Pengiriman</h3>
           <div className="flex items-center gap-2">
             <Search size={18} className="text-muted-foreground"/>
             <Input type="date" className="h-8 max-w-[150px]" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}/>
           </div>
        </div>

        {loading ? <StateCard icon={<Truck/>} title="Memuat" description=""/> :
         distribusi.length===0 ? <StateCard icon={<Truck/>} title="Belum Ada Distribusi" description="Tidak ada jadwal untuk sekolah manapun."/> :
         distribusi.map((d: any) => (
           <Card key={d.id}>
             <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <div className="font-bold flex items-center gap-2">
                    {d.sekolah?.nama}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Dapur: {d.dapur?.nama}</div>
                  <div className="text-sm font-medium mt-1 text-primary">{d.jumlahPorsi} Porsi</div>
                </div>
                
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge variant={d.status === 'DRAFT' ? 'outline' : d.status === 'DIKIRIM'? 'default' : d.status === 'DITERIMA' ? 'default': 'destructive'}>
                     {d.status}
                  </Badge>
                  {d.status === 'DRAFT' && (
                    <Button size="sm" onClick={() => updateStatus(d.id, 'DIKIRIM')}><Send size={14} className="mr-1"/> Kirim Makanan</Button>
                  )}
                </div>
             </CardContent>
             {d.catatanGuru && (
               <div className="bg-destructive/10 px-4 py-2 border-t border-destructive/20 text-xs text-destructive flex flex-col gap-1">
                 <strong>Catatan Guru:</strong> {d.catatanGuru}
               </div>
             )}
           </Card>
         ))
        }
      </div>
    </div>
  );
}
