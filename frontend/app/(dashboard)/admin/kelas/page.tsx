'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '../../../../components/layout/PageHeader';
import { StateCard } from '../../../../components/layout/StateCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Badge } from '../../../../components/ui/Badge';
import { Select } from '../../../../components/ui/Select';
import { Tabs } from '../../../../components/ui/Tabs';
import { toast } from '../../../../components/ui/Toast';
import { ConfirmDialog } from '../../../../components/ui/ConfirmDialog';
import { ArrowLeft, Plus, LayoutGrid, Loader2, Edit, Trash2, FileSpreadsheet, Upload, AlertCircle, Search, X } from 'lucide-react';
import { DataTable, Column } from '../../../../components/ui/DataTable';

export default function AdminKelasPage() {
  const [kelas, setKelas] = useState<any[]>([]);
  const [sekolah, setSekolah] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sekolahFilter, setSekolahFilter] = useState('ALL');
  const [tab, setTab] = useState<'SINGLE' | 'BATCH'>('SINGLE');
  const [batchErrors, setBatchErrors] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ nama: '', sekolahId: '' });

  const openAddForm = () => {
    setForm({ nama: '', sekolahId: '' });
    setBatchErrors([]);
    setTab('SINGLE');
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setConfirmId(id);
  };

  const executeDelete = async () => {
    if (!confirmId) return;
    setConfirmLoading(true);
    try {
      const res = await fetch(`/api/proxy/kelas/${confirmId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus kelas');
      toast.success('Kelas berhasil dihapus');
      loadData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setConfirmLoading(false);
      setConfirmId(null);
    }
  };

  const startEdit = (k: any) => {
    setEditingId(k.id);
    setEditForm({ nama: k.nama, sekolahId: k.sekolahId });
  };

  const handleEdit = async () => {
    if (!editingId) return;
    try {
      const res = await fetch(`/api/proxy/kelas/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (!res.ok) throw new Error('Gagal update kelas');
      setEditingId(null);
      toast.success('Perubahan tersimpan');
      loadData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

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
      toast.success('Kelas berhasil ditambahkan');
      setShowForm(false);
      loadData();
    } catch (e: any) {
      toast.error(e.message);
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
        const items = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim());
          if (cols.length < 2) {
            setBatchErrors(prev => [...prev, { row: i + 1, nama: cols[0] || 'Unknown', message: 'Format kolom tidak lengkap' }]);
            continue;
          }
          items.push({ nama: cols[0], sekolahId: cols[1] });
        }
        if (items.length === 0 && lines.length > 1) throw new Error('Tidak ada data valid.');
        const res = await fetch('/api/proxy/kelas/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kelas: items })
        });
        const dataJson = await res.json();
        if (!res.ok) {
          if (dataJson.details && dataJson.details.errors) {
            setBatchErrors(dataJson.details.errors);
            throw new Error('Beberapa data gagal diunggah.');
          }
          throw new Error(dataJson.message || 'Gagal batch upload');
        }
        if (dataJson.data && dataJson.data.errors && dataJson.data.errors.length > 0) {
           setBatchErrors(dataJson.data.errors);
           toast.warning(`Berhasil upload ${dataJson.data.success} data, gagal ${dataJson.data.failed}.`);
        } else {
           toast.success(`Berhasil upload semua ${items.length} data tanpa error!`);
           setShowForm(false);
        }
        loadData();
      } catch(e: any) {
        toast.error(e.message);
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
        title="Manajemen Kelas / Grup"
        description="Kelola daftar kelas dan kelompok di masing-masing sekolah penerima manfaat."
        action={
          <Button onClick={openAddForm} className="gap-2">
            <Plus size={16} /> Tambah Kelas
          </Button>
        }
      />

      <div className="space-y-6">
        <div className="flex flex-col gap-3 px-1 mb-4">
          <h3 className="font-bold text-xl text-foreground">Daftar Kelas</h3>
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
            <Select
              value={sekolahFilter}
              onChange={(e) => setSekolahFilter(e.target.value)}
              className="bg-white"
              wrapperClassName="sm:w-[220px]"
              options={[{ label: 'Pilih Sekolah', value: 'ALL' }, ...sekolah.map(s => ({ label: s.nama, value: s.id }))]}
            />
          </div>
        </div>
        {loading ? (
          <StateCard icon={<Loader2 size={32} className="animate-spin" />} title="Memuat Data" description="Mohon tunggu sebentar..." />
        ) : error ? (
          <StateCard icon={<LayoutGrid size={32} />} title="Gagal Memuat" description={error} action={<Button variant="outline" onClick={loadData}>Coba Lagi</Button>} />
        ) : kelas.length === 0 ? (
          <StateCard icon={<LayoutGrid size={32} />} title="Belum Ada Data" description="Klik tombol 'Tambah Kelas' untuk menambah data." action={<Button onClick={openAddForm} className="gap-2"><Plus size={16} /> Tambah Kelas</Button>} />
        ) : (
          <DataTable
            data={kelas.filter(k => {
              const matchSekolah = sekolahFilter === 'ALL' || k.sekolahId === sekolahFilter;
              const matchSearch = !searchQuery || k.nama.toLowerCase().includes(searchQuery.toLowerCase());
              return matchSekolah && matchSearch;
            })}
            columns={[
              {
                header: 'Nama Kelas',
                accessorKey: 'nama',
                sortable: true,
                cell: (k) => (
                  <span className="font-semibold text-foreground text-base truncate" title={k.nama}>{k.nama}</span>
                ),
              },
              {
                header: 'Sekolah',
                accessorKey: 'sekolahName',
                sortAccessorFn: (k) => k.sekolah?.nama || '',
                sortable: true,
                cell: (k) => (
                  <Badge variant="secondary" className="text-center">{k.sekolah?.nama || 'Tanpa Sekolah'}</Badge>
                )
              },
              {
                header: 'Aksi',
                className: 'text-center sticky right-0 bg-white shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] min-w-[120px]',
                cell: (k) => (
                  <div className="flex justify-center gap-2">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => startEdit(k)} title="Edit">
                      <Edit size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive/80 hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(k.id)} title="Hapus">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                )
              }
            ]}
            keyExtractor={(k) => k.id}
            editingRowId={editingId}
            renderEditRow={(k) => (
              <div className="flex flex-col sm:flex-row gap-4 p-2 bg-background rounded-lg border border-border shadow-sm">
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Nama Kelas</label>
                      <Input value={editForm.nama} onChange={e => setEditForm({...editForm, nama: e.target.value})} placeholder="Nama Kelas" className="h-9" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Asal Sekolah</label>
                      <Select
                        value={editForm.sekolahId}
                        onChange={e => setEditForm({...editForm, sekolahId: e.target.value})}
                        placeholder="-- Pilih Sekolah --"
                        options={sekolah.map(s => ({ label: s.nama, value: s.id }))}
                      />
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

      {/* Modal Tambah Kelas */}
      {showForm && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowForm(false)}
        >
          <div
            className="w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/40 p-5 shrink-0">
              <h2 className="text-base font-bold text-foreground">Tambah Kelas / Grup</h2>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 pt-4 shrink-0">
              <Tabs
                value={tab}
                onValueChange={(v) => setTab(v as 'SINGLE' | 'BATCH')}
                items={[
                  { value: 'SINGLE', label: 'Input Manual', icon: Plus },
                  { value: 'BATCH', label: 'Upload CSV', icon: FileSpreadsheet },
                ]}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {tab === 'SINGLE' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Asal Sekolah</label>
                      <Select
                        value={form.sekolahId}
                        onChange={e => setForm({...form, sekolahId: e.target.value})}
                        required
                        placeholder="-- Pilih Sekolah --"
                        options={sekolah.map(s => ({ label: s.nama, value: s.id }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nama Kelas / Grup</label>
                      <Input placeholder="Contoh: 1A, atau Kelompok A" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} required/>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Batal</Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? <><Loader2 size={16} className="mr-2 animate-spin" /> Menyimpan...</> : 'Simpan Kelas'}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload size={32} className="mx-auto text-muted-foreground mb-4"/>
                    <h3 className="font-semibold text-lg text-foreground">Format CSV Batch Upload</h3>
                    <p className="text-sm text-muted-foreground">Silakan download template CSV di bawah ini dan isi dengan data yang benar sebelum di-upload.</p>

                    <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
                       <Button variant="outline" type="button" className="w-full sm:w-auto" onClick={() => {
                         const csvContent = "data:text/csv;charset=utf-8,Nama Kelas,ID Sekolah\n1A,SEKOLAH_ID\n1B,SEKOLAH_ID";
                         const encodedUri = encodeURI(csvContent);
                         const link = document.createElement("a");
                         link.setAttribute("href", encodedUri);
                         link.setAttribute("download", "template_kelas.csv");
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
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmId}
        title="Hapus kelas ini?"
        description="Data kelas akan dihapus permanen dan tidak dapat dikembalikan."
        confirmLabel="Hapus"
        destructive
        loading={confirmLoading}
        onConfirm={executeDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
