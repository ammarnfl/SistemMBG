'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '../../../../components/layout/PageHeader';
import { StateCard } from '../../../../components/layout/StateCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { StatusBadge } from '../../../../components/ui/StatusBadge';
import { Select } from '../../../../components/ui/Select';
import { Tabs } from '../../../../components/ui/Tabs';
import { toast } from '../../../../components/ui/Toast';
import { Truck, Upload, Plus, FileSpreadsheet, Send, Search, Pencil, X } from 'lucide-react';

export default function DapurDistribusiPage() {
  const [distribusi, setDistribusi] = useState<any[]>([]);
  const [sekolah, setSekolah] = useState<any[]>([]);
  const [dapur, setDapur] = useState<any[]>([]);
  const [jadwal, setJadwal] = useState<any[]>([]);
  const [listJadwal, setListJadwal] = useState<any[]>([]);
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'SINGLE' | 'BATCH'>('SINGLE');

  const [filterDate, setFilterDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!filterDate) { setListJadwal([]); return; }
    let active = true;
    fetch(`/api/proxy/menu/jadwal/list?tanggal=${filterDate}`)
      .then((r) => r.json())
      .then((j) => {
        if (!active) return;
        setListJadwal(Array.isArray(j?.data) ? j.data : (Array.isArray(j) ? j : []));
      })
      .catch(() => { if (active) setListJadwal([]); });
    return () => { active = false; };
  }, [filterDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resDist, resSekolah, resDapur] = await Promise.all([
        fetch(`/api/proxy/distribusi?tanggal=${filterDate}`),
        fetch('/api/proxy/sekolah'),
        fetch('/api/proxy/dapur'),
      ]);
      const distJson = await resDist.json();
      const sekolahJson = await resSekolah.json();
      const dapurJson = await resDapur.json();

      setDistribusi(Array.isArray(distJson?.data) ? distJson.data : (Array.isArray(distJson) ? distJson : []));
      setSekolah(Array.isArray(sekolahJson?.data) ? sekolahJson.data : (Array.isArray(sekolahJson) ? sekolahJson : []));
      setDapur(Array.isArray(dapurJson?.data) ? dapurJson.data : (Array.isArray(dapurJson) ? dapurJson : []));
    } catch(e) {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [filterDate]);

  // Form Single
  const [form, setForm] = useState({ tanggal: filterDate, sekolahId: '', menuId: '', jumlahPorsi: '', catatanDapur: '' });
  const [saving, setSaving] = useState(false);

  // Menu dropdown follows the form's date (the date the distribusi is created for),
  // not the list filter date below — so menus activated for a future date show up.
  useEffect(() => {
    if (!form.tanggal) { setJadwal([]); return; }
    let active = true;
    fetch(`/api/proxy/menu/jadwal/list?tanggal=${form.tanggal}`)
      .then((r) => r.json())
      .then((j) => {
        if (!active) return;
        setJadwal(Array.isArray(j?.data) ? j.data : (Array.isArray(j) ? j : []));
      })
      .catch(() => { if (active) setJadwal([]); });
    return () => { active = false; };
  }, [form.tanggal]);

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
      toast.success('Distribusi berhasil dibuat');
      loadData();
    } catch(e: any) { toast.error(e.message); }
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
        toast.success('Berhasil upload ' + items.length + ' data.');
        loadData();
      } catch(e: any) {
        toast.error(e.message);
      } finally {
        setSaving(false);
        // reset input
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const updateMenu = async (id: string, newMenuId: string) => {
    try {
      const res = await fetch(`/api/proxy/distribusi/${id}/menu`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuId: newMenuId || null })
      });
      if (!res.ok) throw new Error('Gagal memperbarui menu');
      toast.success('Menu distribusi diperbarui');
      setEditingMenuId(null);
      loadData();
    } catch(e: any) { toast.error(e.message); }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/proxy/distribusi/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Gagal memperbarui status');
      toast.success('Status distribusi diperbarui');
      loadData();
    } catch(e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Distribusi Makanan" 
        description="Jadwalkan pengiriman dan perbarui status keberangkatan."
      />

      <Card>
        <CardHeader className="border-b border-border/40">
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as 'SINGLE' | 'BATCH')}
            items={[
              { value: 'SINGLE', label: 'Input Manual', icon: Plus },
              { value: 'BATCH', label: 'Upload CSV', icon: FileSpreadsheet },
            ]}
          />
        </CardHeader>
        <CardContent>
          {tab === 'SINGLE' ? (
            <form onSubmit={handleSingleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tanggal</label>
                  <Input type="date" value={form.tanggal} onChange={e=>setForm({...form, tanggal: e.target.value, menuId: ''})} required/>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Menu (Dari Jadwal Aktif)</label>
                  <Select
                    value={form.menuId}
                    onChange={e=>setForm({...form, menuId: e.target.value})}
                    placeholder="-- Pilih Menu (Opsional) --"
                    options={jadwal.map(j => ({ label: j.menu?.nama ?? '', value: j.menu?.id ?? '' }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sekolah Tujuan</label>
                  <Select
                    value={form.sekolahId}
                    onChange={e=>setForm({...form, sekolahId: e.target.value})}
                    required
                    placeholder="-- Sekolah --"
                    options={sekolah.map(s => ({ label: s.nama, value: s.id }))}
                  />
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
              
              <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
                 <Button variant="outline" type="button" className="w-full sm:w-auto" onClick={() => {
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
                 
                 <div className="relative w-full sm:w-auto">
                   <input type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                   <Button disabled={saving} className="w-full">{saving?'Uploading...':'Pilih File CSV & Upload'}</Button>
                 </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
           <h2 className="text-lg font-semibold text-foreground">Status Pengiriman</h2>
           <div className="flex items-center gap-2">
             <Search size={18} className="text-muted-foreground"/>
             <Input type="date" className="h-9 w-auto max-w-[160px]" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}/>
           </div>
        </div>

        {loading ? <StateCard icon={<Truck/>} title="Memuat" description=""/> :
         distribusi.length===0 ? <StateCard icon={<Truck/>} title="Belum Ada Distribusi" description="Tidak ada jadwal untuk sekolah manapun."/> :
         distribusi.map((d: any) => (
           <Card key={d.id}>
             <CardContent className="pt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1 min-w-[200px]">
                  <div className="font-bold flex items-center gap-2">
                    {d.sekolah?.nama}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Dapur: {d.dapur?.nama}</div>
                  <div className="text-sm font-medium mt-1 text-primary">{d.jumlahPorsi} Porsi</div>
                  {editingMenuId === d.id ? (
                    <div className="mt-4 max-w-md bg-muted/40 p-4 rounded-lg border border-border/50 animate-in fade-in slide-in-from-top-1">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-foreground">Ganti Menu Makanan</label>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => setEditingMenuId(null)}>
                          <X size={14} />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">Silakan pilih menu pengganti dari daftar jadwal aktif pada tanggal ini. Pembaruan akan langsung tersimpan secara otomatis setelah Anda memilih.</p>
                      <Select
                        value={d.menu?.id ?? ''}
                        onChange={(e) => updateMenu(d.id, e.target.value)}
                        placeholder="-- Pilih Menu --"
                        options={listJadwal.map(j => ({ label: j.menu?.nama ?? '', value: j.menu?.id ?? '' }))}
                        className="h-9 text-sm w-full bg-background"
                      />
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground mt-1">
                      Menu: <span className="font-medium text-foreground">{d.menu?.nama || 'Belum diatur'}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex w-full sm:w-auto flex-row sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    {d.status === 'DRAFT' && editingMenuId !== d.id && (
                      <Button variant="outline" size="sm" onClick={() => setEditingMenuId(d.id)} className="h-7 text-xs px-2.5 gap-1.5 shadow-sm bg-background">
                        <Pencil size={12} /> Ubah Menu
                      </Button>
                    )}
                    <StatusBadge status={d.status} />
                  </div>
                  {d.status === 'DRAFT' && (
                    <Button size="sm" onClick={() => updateStatus(d.id, 'DIKIRIM')} className="w-full sm:w-auto shadow-sm">
                      <Send size={14} className="mr-1.5"/> Kirim Makanan
                    </Button>
                  )}
                </div>
             </CardContent>
             {d.catatanGuru && (
               <div className="border-t border-destructive/20 bg-destructive/10 px-6 py-3 text-xs text-destructive flex flex-col gap-1">
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
