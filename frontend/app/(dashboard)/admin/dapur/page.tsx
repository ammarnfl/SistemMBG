'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '../../../../components/layout/PageHeader';
import { StateCard } from '../../../../components/layout/StateCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { ArrowLeft, Plus, UtensilsCrossed, Loader2, Edit, Trash2, FileSpreadsheet, Upload, AlertCircle, Copy, Search } from 'lucide-react';
import { DataTable, Column } from '../../../../components/ui/DataTable';

export default function AdminDapurPage() {
  const [dapur, setDapur] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [provinsiFilter, setProvinsiFilter] = useState('ALL');
  const [kabupatenFilter, setKabupatenFilter] = useState('ALL');
  const [tab, setTab] = useState<'SINGLE' | 'BATCH'>('SINGLE');
  const [batchErrors, setBatchErrors] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/proxy/dapur');
      if (!res.ok) throw new Error('Gagal mengambil data dapur');
      const data = await res.json();
      setDapur(data.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const [form, setForm] = useState({ nama: '', alamat: '', kontak: '', provinsi: '', kabupatenKota: '', kecamatan: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ nama: '', alamat: '', kontak: '', provinsi: '', kabupatenKota: '', kecamatan: '' });

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus dapur ini?')) return;
    try {
      const res = await fetch(`/api/proxy/dapur/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus dapur');
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const startEdit = (d: any) => {
    setEditingId(d.id);
    setEditForm({ nama: d.nama, alamat: d.alamat || '', kontak: d.kontak || '', provinsi: d.provinsi || '', kabupatenKota: d.kabupatenKota || '', kecamatan: d.kecamatan || '' });
  };

  const handleEdit = async () => {
    if (!editingId) return;
    try {
      const res = await fetch(`/api/proxy/dapur/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Gagal update dapur');
      }
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
      const res = await fetch('/api/proxy/dapur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Gagal simpan dapur');
      setForm({ nama: '', alamat: '', kontak: '', provinsi: '', kabupatenKota: '', kecamatan: '', email: '' });
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
        
        // Format: Nama Dapur, Alamat, Email PIC Dapur
        const items = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim());
          if (cols.length < 3) {
            setBatchErrors(prev => [...prev, { row: i + 1, nama: cols[0] || 'Unknown', message: 'Format kolom tidak lengkap (Minimal 3 kolom: Nama, Alamat, Email)' }]);
            continue;
          }
          items.push({
            nama: cols[0],
            alamat: cols[1],
            email: cols[2]
          });
        }

        if (items.length === 0 && lines.length > 1) {
           throw new Error('Tidak ada data valid yang bisa dikirim.');
        }

        const res = await fetch('/api/proxy/dapur/batch', {
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
        title="Manajemen Dapur" 
        description="Kelola daftar fasilitas dapur umum/penyedia makanan MBG."
      />

      <Card>
        <CardHeader className="pb-4 border-b bg-muted/10">
          <div className="flex bg-secondary/50 p-1 rounded-lg w-fit border border-border/50">
            <button onClick={() => setTab('SINGLE')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${tab==='SINGLE'?'bg-white text-primary shadow-sm ring-1 ring-border/50':'text-muted-foreground hover:text-foreground hover:bg-white/50'}`}>
              <div className="flex items-center gap-2"><Plus size={16}/> Input Manual</div>
            </button>
            <button onClick={() => setTab('BATCH')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${tab==='BATCH'?'bg-white text-primary shadow-sm ring-1 ring-border/50':'text-muted-foreground hover:text-foreground hover:bg-white/50'}`}>
              <div className="flex items-center gap-2"><FileSpreadsheet size={16}/> Upload CSV</div>
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {tab === 'SINGLE' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nama Dapur</label>
                  <Input placeholder="Misal: Dapur Umum Pusat" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} required/>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Akun PIC Dapur</label>
                  <Input type="email" placeholder="email@contoh.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required/>
                  <p className="text-xs text-muted-foreground">Sandi bawaan: <b>mbg12345</b></p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Alamat (Wajib)</label>
                  <Input placeholder="Alamat lengkap fasilitas dapur" value={form.alamat} onChange={e => setForm({...form, alamat: e.target.value})} required/>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kontak (Opsional)</label>
                  <Input placeholder="No. Telepon / HP" value={form.kontak} onChange={e => setForm({...form, kontak: e.target.value})}/>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Provinsi (Opsional)</label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors" 
                    value={form.provinsi} onChange={e => setForm({...form, provinsi: e.target.value})}
                  >
                    <option value="">-- Pilih Provinsi --</option>
                    <option value="Jawa Barat">Jawa Barat</option>
                    <option value="DKI Jakarta">DKI Jakarta</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kabupaten/Kota (Opsional)</label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors" 
                    value={form.kabupatenKota} onChange={e => setForm({...form, kabupatenKota: e.target.value})}
                  >
                    <option value="">-- Pilih Kabupaten/Kota --</option>
                    <option value="Bandung">Bandung</option>
                    <option value="Jakarta Selatan">Jakarta Selatan</option>
                  </select>
                </div>
              </div>
              <div className="pt-2">
                <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                  {saving ? <><Loader2 size={16} className="mr-2 animate-spin" /> Menyimpan...</> : 'Simpan Dapur'}
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
                     const csvContent = "data:text/csv;charset=utf-8,Nama Dapur,Alamat,Email PIC Dapur\nDapur Satelit A,Jl. Cihanjuang No 12,dapura@example.com\nDapur Satelit B,Jl. Merdeka No 5,dapurb@example.com";
                     const encodedUri = encodeURI(csvContent);
                     const link = document.createElement("a");
                     link.setAttribute("href", encodedUri);
                     link.setAttribute("download", "template_dapur.csv");
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
        <div className="flex flex-col gap-3 px-1 mb-4">
          <h3 className="font-bold text-xl text-foreground">Daftar Dapur</h3>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-[250px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Cari di sini..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)}
                className="h-9 pl-9 w-full bg-white"
              />
            </div>
            <select 
              className="h-9 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors text-muted-foreground focus:text-foreground w-full sm:w-[160px]"
              value={provinsiFilter} onChange={(e) => setProvinsiFilter(e.target.value)}
            >
              <option value="ALL">Pilih Provinsi</option>
              <option value="Jawa Barat">Jawa Barat</option>
              <option value="DKI Jakarta">DKI Jakarta</option>
            </select>
            <select 
              className="h-9 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors text-muted-foreground focus:text-foreground w-full sm:w-[180px]"
              value={kabupatenFilter} onChange={(e) => setKabupatenFilter(e.target.value)}
            >
              <option value="ALL">Pilih Kabupaten/Kota</option>
              <option value="Bandung">Bandung</option>
              <option value="Jakarta Selatan">Jakarta Selatan</option>
            </select>
          </div>
        </div>
        {loading ? (
          <StateCard icon={<Loader2 size={32} className="animate-spin" />} title="Memuat Data" description="Mohon tunggu sebentar..." />
        ) : error ? (
          <StateCard icon={<UtensilsCrossed size={32} />} title="Gagal Memuat" description={error} action={<Button variant="outline" onClick={loadData}>Coba Lagi</Button>} />
        ) : dapur.length === 0 ? (
          <StateCard icon={<UtensilsCrossed size={32} />} title="Belum Ada Data" description="Silahkan tambah data dapur baru di atas." />
        ) : (
          <DataTable 
            data={dapur.filter(d => {
              const matchProvinsi = provinsiFilter === 'ALL' || d.provinsi === provinsiFilter;
              const matchKabupaten = kabupatenFilter === 'ALL' || d.kabupatenKota === kabupatenFilter;
              const matchSearch = !searchQuery || d.nama.toLowerCase().includes(searchQuery.toLowerCase());
              return matchProvinsi && matchKabupaten && matchSearch;
            })}
            columns={[
              {
                header: 'Nama Dapur',
                accessorKey: 'nama',
                sortable: true,
                cell: (d) => (
                  <div className="flex flex-col min-w-[200px]">
                    <span className="font-semibold text-foreground text-base truncate" title={d.nama}>{d.nama}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/50">
                        ID: {d.id.substring(0, 8)}...
                      </div>
                      <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-primary" onClick={() => {
                        navigator.clipboard.writeText(d.id);
                        alert('ID Dapur berhasil disalin!');
                      }} title="Salin ID Lengkap">
                        <Copy size={12} />
                      </Button>
                    </div>
                  </div>
                ),
              },
              {
                header: 'Alamat',
                accessorKey: 'alamat',
                sortable: true,
                cell: (d) => (
                  <span className="text-sm text-muted-foreground line-clamp-2 max-w-[300px]" title={d.alamat || ''}>
                    {d.alamat || 'Alamat tidak tersedia'}
                  </span>
                )
              },
              {
                header: 'Kontak',
                accessorKey: 'kontak',
                sortable: false,
                cell: (d) => (
                  <span className="text-sm text-muted-foreground">{d.kontak || '-'}</span>
                )
              },
              {
                header: 'Provinsi',
                accessorKey: 'provinsi',
                sortable: true,
                cell: (d) => (
                  <span className="text-sm">{d.provinsi || '-'}</span>
                )
              },
              {
                header: 'Kabupaten/Kota',
                accessorKey: 'kabupatenKota',
                sortable: true,
                cell: (d) => (
                  <span className="text-sm">{d.kabupatenKota || '-'}</span>
                )
              },
              {
                header: 'Aksi',
                className: 'text-center sticky right-0 bg-white shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] min-w-[120px]',
                cell: (d) => (
                  <div className="flex justify-center gap-2">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => startEdit(d)} title="Edit">
                      <Edit size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive/80 hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(d.id)} title="Hapus">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                )
              }
            ]}
            keyExtractor={(d) => d.id}
            editingRowId={editingId}
            renderEditRow={(d) => (
              <div className="flex flex-col sm:flex-row gap-4 p-2 bg-background rounded-lg border border-border shadow-sm">
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Nama Dapur</label>
                      <Input value={editForm.nama} onChange={e => setEditForm({...editForm, nama: e.target.value})} placeholder="Nama Dapur" className="h-9" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Alamat</label>
                      <Input value={editForm.alamat} onChange={e => setEditForm({...editForm, alamat: e.target.value})} placeholder="Alamat" className="h-9" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Kontak</label>
                      <Input value={editForm.kontak} onChange={e => setEditForm({...editForm, kontak: e.target.value})} placeholder="Kontak" className="h-9" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Provinsi</label>
                      <select 
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors" 
                        value={editForm.provinsi} onChange={e => setEditForm({...editForm, provinsi: e.target.value})}
                      >
                        <option value="">-- Pilih --</option>
                        <option value="Jawa Barat">Jawa Barat</option>
                        <option value="DKI Jakarta">DKI Jakarta</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Kabupaten/Kota</label>
                      <select 
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors" 
                        value={editForm.kabupatenKota} onChange={e => setEditForm({...editForm, kabupatenKota: e.target.value})}
                      >
                        <option value="">-- Pilih --</option>
                        <option value="Bandung">Bandung</option>
                        <option value="Jakarta Selatan">Jakarta Selatan</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col justify-end gap-2 shrink-0">
                  <Button size="sm" onClick={handleEdit} className="w-full">Simpan</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="w-full">Batal</Button>
                </div>
              </div>
            )}
            defaultSort={{ key: 'nama', direction: 'asc' }}
          />
        )}
      </div>
    </div>
  );
}
