'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '../../../../components/layout/PageHeader';
import { StateCard } from '../../../../components/layout/StateCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Badge } from '../../../../components/ui/Badge';
import { ArrowLeft, Plus, School, Loader2, Edit, Trash2, FileSpreadsheet, Upload, AlertCircle, Copy } from 'lucide-react';

export default function AdminSekolahPage() {
  const [sekolah, setSekolah] = useState<any[]>([]);
  const [dapur, setDapur] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'SINGLE' | 'BATCH'>('SINGLE');
  const [batchErrors, setBatchErrors] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resSekolah, resDapur] = await Promise.all([
        fetch('/api/proxy/sekolah'),
        fetch('/api/proxy/dapur')
      ]);
      const dataSekolah = await resSekolah.json();
      const dataDapur = await resDapur.json();
      setSekolah(dataSekolah.data || []);
      setDapur(dataDapur.data || []);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const [form, setForm] = useState({ nama: '', alamat: '', dapurId: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ nama: '', alamat: '', dapurId: '' });

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus sekolah ini?')) return;
    try {
      const res = await fetch(`/api/proxy/sekolah/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus sekolah');
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const startEdit = (s: any) => {
    setEditingId(s.id);
    setEditForm({ nama: s.nama, alamat: s.alamat || '', dapurId: s.dapurId || '' });
  };

  const handleEdit = async () => {
    if (!editingId) return;
    try {
      const payload: any = { nama: editForm.nama, alamat: editForm.alamat };
      if (editForm.dapurId) payload.dapurId = editForm.dapurId;
      else payload.dapurId = null;

      const res = await fetch(`/api/proxy/sekolah/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Gagal update sekolah');
      setEditingId(null);
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = { nama: form.nama, alamat: form.alamat, email: form.email };
      if (form.dapurId) payload.dapurId = form.dapurId;
      
      const res = await fetch('/api/proxy/sekolah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Gagal simpan sekolah');
      setForm({ nama: '', alamat: '', dapurId: '', email: '' });
      loadData();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(!file) return;

    setSaving(true);
    setBatchErrors([]);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim() !== '');
        
        // Format: Nama Sekolah, Alamat, Email PIC Sekolah, ID Dapur (Opsional)
        const items = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim());
          if (cols.length < 3) {
            setBatchErrors(prev => [...prev, { row: i + 1, nama: cols[0] || 'Unknown', message: 'Format kolom tidak lengkap (Minimal 3 kolom: Nama, Alamat, Email)' }]);
            continue;
          }
          const payload: any = {
            nama: cols[0],
            alamat: cols[1],
            email: cols[2]
          };
          if (cols[3]) payload.dapurId = cols[3];
          items.push(payload);
        }

        if (items.length === 0 && lines.length > 1) {
           throw new Error('Tidak ada data valid yang bisa dikirim.');
        }

        const res = await fetch('/api/proxy/sekolah/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items })
        });
        
        const dataJson = await res.json();
        
        if (!res.ok) {
          if (dataJson.details && dataJson.details.errors) {
            setBatchErrors(dataJson.details.errors);
            throw new Error('Beberapa data gagal diunggah. Lihat daftar error di bawah.');
          }
          throw new Error(dataJson.message || 'Gagal batch upload');
        }

        if (dataJson.data && dataJson.data.errors && dataJson.data.errors.length > 0) {
           setBatchErrors(dataJson.data.errors);
           alert(`Berhasil upload ${dataJson.data.success} data, namun ada ${dataJson.data.failed} data yang gagal.`);
        } else {
           alert(`Berhasil upload semua ${items.length} data tanpa error!`);
        }

        loadData();
      } catch(e: any) {
        alert(e.message);
      } finally {
        setSaving(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
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
        title="Manajemen Sekolah" 
        description="Kelola daftar sekolah dan pemetaan ke dapur penyedia."
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nama Sekolah</label>
                  <Input placeholder="Misal: SDN 1 Merdeka" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} required/>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Akun PIC Sekolah</label>
                  <Input type="email" placeholder="email@contoh.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required/>
                  <p className="text-xs text-muted-foreground">Sandi bawaan: <b>mbg12345</b></p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Alamat (Opsional)</label>
                  <Input placeholder="Alamat lengkap" value={form.alamat} onChange={e => setForm({...form, alamat: e.target.value})}/>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Dapur Penyedia</label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                    value={form.dapurId} onChange={e => setForm({...form, dapurId: e.target.value})}
                  >
                    <option value="">-- Belum Dipetakan --</option>
                    {dapur.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
                  </select>
                </div>
              </div>
              <div className="pt-2">
                <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                  {saving ? <><Loader2 size={16} className="mr-2 animate-spin" /> Menyimpan...</> : 'Simpan Sekolah'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload size={32} className="mx-auto text-muted-foreground mb-4"/>
                <h3 className="font-semibold text-lg text-foreground">Format CSV Batch Upload</h3>
                <p className="text-sm text-muted-foreground">Silakan download template CSV di bawah ini dan isi dengan data yang benar sebelum di-upload.</p>
                
                <div className="flex justify-center gap-4 mt-4">
                   <Button variant="outline" type="button" onClick={() => {
                     const csvContent = "data:text/csv;charset=utf-8,Nama Sekolah,Alamat,Email PIC Sekolah,ID Dapur (Opsional)\nSDN 1 Merdeka,Jl. Merdeka No 1,sdn1@example.com,DAPUR_ID_OPSIONAL\nSDN 2 Merdeka,Jl. Merdeka No 2,sdn2@example.com,";
                     const encodedUri = encodeURI(csvContent);
                     const link = document.createElement("a");
                     link.setAttribute("href", encodedUri);
                     link.setAttribute("download", "template_sekolah.csv");
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

              {batchErrors.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 mt-4">
                  <div className="flex items-center gap-2 text-destructive font-semibold mb-2">
                    <AlertCircle size={18} /> Terdapat Kesalahan saat Upload ({batchErrors.length} data gagal)
                  </div>
                  <ul className="list-disc list-inside text-sm text-destructive space-y-1">
                    {batchErrors.map((err, i) => (
                      <li key={i}>
                        <strong>Baris {err.row} ({err.nama}):</strong> {err.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="pt-10 space-y-6">
        <h3 className="font-bold text-lg text-foreground px-1 mb-2">Daftar Sekolah</h3>
        {loading ? (
          <StateCard icon={<Loader2 size={32} className="animate-spin" />} title="Memuat Data" description="Mohon tunggu sebentar..." />
        ) : sekolah.length === 0 ? (
          <StateCard icon={<School size={32} />} title="Belum Ada Data" description="Silahkan tambah data sekolah baru di atas." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {sekolah.map((s, i) => (
              <Card key={i} className="flex flex-col">
                <CardContent className="p-6 flex-1 flex flex-col justify-between gap-4">
                  {editingId === s.id ? (
                    <div className="space-y-3">
                      <Input value={editForm.nama} onChange={e => setEditForm({...editForm, nama: e.target.value})} placeholder="Nama Sekolah" />
                      <Input value={editForm.alamat} onChange={e => setEditForm({...editForm, alamat: e.target.value})} placeholder="Alamat" />
                      <select 
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                        value={editForm.dapurId} onChange={e => setEditForm({...editForm, dapurId: e.target.value})}
                      >
                        <option value="">-- Belum Dipetakan --</option>
                        {dapur.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
                      </select>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" onClick={handleEdit}>Simpan</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Batal</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5 min-w-0">
                          <div className="font-bold text-foreground text-lg truncate" title={s.nama}>{s.nama}</div>
                          <div className="flex items-center gap-2">
                             <div className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/50">
                               ID: {s.id.substring(0, 8)}...
                             </div>
                             <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => {
                                navigator.clipboard.writeText(s.id);
                                alert('ID Sekolah berhasil disalin!');
                             }} title="Salin ID Lengkap">
                               <Copy size={14} />
                             </Button>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0 pt-1">
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" onClick={() => startEdit(s)}>
                            <Edit size={18} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive/80 hover:text-destructive" onClick={() => handleDelete(s.id)}>
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground bg-secondary/20 p-3 rounded-lg border border-border/40 line-clamp-2 min-h-[50px]">
                        {s.alamat || 'Tidak ada alamat'}
                      </div>
                      <div className="pt-1">
                        {s.dapur ? (
                          <Badge variant="warning" className="text-xs px-2 h-6">Dapur: {s.dapur.nama}</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs px-2 h-6">Belum Dipetakan</Badge>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
