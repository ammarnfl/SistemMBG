'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '../../../../components/layout/PageHeader';
import { StateCard } from '../../../../components/layout/StateCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Badge } from '../../../../components/ui/Badge';
import { DataTable, Column } from '../../../../components/ui/DataTable';
import { ArrowLeft, UserPlus, Users, Loader2, Edit, Trash2, UserCheck, UserX, Search, Plus, FileSpreadsheet, Upload, AlertCircle } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [dapurList, setDapurList] = useState<any[]>([]);
  const [sekolahList, setSekolahList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<'SINGLE' | 'BATCH'>('SINGLE');
  const [batchErrors, setBatchErrors] = useState<any[]>([]);
  const [kelasList, setKelasList] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resUsers, resDapur, resSekolah, resKelas] = await Promise.all([
        fetch('/api/proxy/admin-users'),
        fetch('/api/proxy/dapur'),
        fetch('/api/proxy/sekolah'),
        fetch('/api/proxy/kelas')
      ]);
      if (!resUsers.ok) throw new Error('Gagal mengambil data user');
      const dataUsers = await resUsers.json();
      const dataDapur = await resDapur.json();
      const dataSekolah = await resSekolah.json();
      const dataKelas = await resKelas.json();
      
      setUsers(dataUsers.data || []);
      setDapurList(dataDapur.data || []);
      setSekolahList(dataSekolah.data || []);
      setKelasList(dataKelas.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'GURU', dapurId: '', sekolahId: '', nisn: '', kelasId: '' });
  const [saving, setSaving] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', role: '', password: '', email: '', nisn: '', kelasId: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = { ...form };
      if (form.role !== 'TIM_DAPUR') delete payload.dapurId;
      if (form.role !== 'GURU' && form.role !== 'PENERIMA_MANFAAT') delete payload.sekolahId;
      if (form.role !== 'PENERIMA_MANFAAT') {
        delete payload.nisn;
        delete payload.kelasId;
      }
      
      const res = await fetch('/api/proxy/admin-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.message || 'Gagal simpan user');
      }
      setForm({ name: '', email: '', password: '', role: 'GURU', dapurId: '', sekolahId: '', nisn: '', kelasId: '' });
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
        
        // Format: Nama, Email, Password, Role, ID Sekolah (opsional), ID Dapur (opsional)
        const items = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim());
          if (cols.length < 4) {
            setBatchErrors(prev => [...prev, { row: i + 1, email: cols[1] || cols[0] || 'Unknown', message: 'Format kolom tidak lengkap (Minimal 4 kolom: Nama, Email, Password, Role)' }]);
            continue;
          }
          const payload: any = {
            name: cols[0],
            email: cols[1],
            password: cols[2],
            role: cols[3]
          };
          if (cols[4]) payload.sekolahId = cols[4];
          if (cols[5]) payload.dapurId = cols[5];
          items.push(payload);
        }

        if (items.length === 0 && lines.length > 1) {
           throw new Error('Tidak ada data valid yang bisa dikirim.');
        }

        const res = await fetch('/api/proxy/admin-users/batch', {
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

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      if (currentActive) {
        if (!confirm('Nonaktifkan pengguna ini?')) return;
        await fetch(`/api/proxy/admin-users/${id}/nonaktifkan`, { method: 'PATCH' });
      } else {
        if (!confirm('Aktifkan kembali pengguna ini?')) return;
        await fetch(`/api/proxy/admin-users/${id}`, { 
          method: 'PATCH', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: true }) 
        });
      }
      loadData();
    } catch (e: any) {
      alert('Gagal merubah status: ' + e.message);
    }
  };

  const startEdit = (u: any) => {
    setEditingId(u.id);
    setEditForm({ name: u.name, role: u.role, password: '', email: u.email, nisn: u.penerimaManfaatProfile?.nisn || '', kelasId: u.penerimaManfaatProfile?.kelasId || '' });
  };

  const handleEdit = async () => {
    if (!editingId) return;
    try {
      const payload: any = { name: editForm.name, role: editForm.role, email: editForm.email };
      if (editForm.password) payload.password = editForm.password;
      if (editForm.role === 'PENERIMA_MANFAAT') {
        payload.nisn = editForm.nisn;
        payload.kelasId = editForm.kelasId;
      }
      
      const res = await fetch(`/api/proxy/admin-users/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.message || 'Gagal update user');
      }
      setEditingId(null);
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' && u.isActive) || (statusFilter === 'INACTIVE' && !u.isActive);
    const searchLower = searchQuery.toLowerCase();
    const matchSearch = !searchQuery || u.name.toLowerCase().includes(searchLower) || u.email.toLowerCase().includes(searchLower);
    return matchRole && matchStatus && matchSearch;
  });

  const columns: Column<any>[] = [
    {
      header: 'Nama & Email',
      accessorKey: 'name',
      sortable: true,
      cell: (u) => (
        <div className="flex flex-col min-w-[200px]">
          <span className="font-semibold text-foreground text-base truncate" title={u.name}>{u.name}</span>
          <span className="text-sm text-muted-foreground truncate" title={u.email}>{u.email}</span>
        </div>
      ),
    },
    {
      header: 'Role',
      accessorKey: 'role',
      sortable: false,
      cell: (u) => <Badge variant="outline" className="bg-secondary/40 text-xs px-2 h-6">{u.role}</Badge>,
    },
    {
      header: 'NISN',
      accessorKey: 'nisn',
      sortable: false,
      cell: (u) => <span className="text-sm">{u.role === 'PENERIMA_MANFAAT' ? (u.penerimaManfaatProfile?.nisn || '-') : '-'}</span>,
    },
    {
      header: 'Unit Terkait',
      accessorKey: 'unit',
      sortAccessorFn: (u) => {
        const dapur = u.timDapurProfile?.dapur?.nama;
        const sekolah = u.guruProfile?.sekolah?.nama || u.penerimaManfaatProfile?.sekolah?.nama;
        return dapur || sekolah || '';
      },
      sortable: false,
      cell: (u) => {
        const dapur = u.timDapurProfile?.dapur;
        const sekolah = u.guruProfile?.sekolah || u.penerimaManfaatProfile?.sekolah;
        const kelas = u.penerimaManfaatProfile?.kelas;

        if (dapur) return <Badge variant="warning" className="text-xs">Dapur: {dapur.nama}</Badge>;
        if (sekolah) {
          return (
            <div className="flex flex-col gap-1 items-start">
              <Badge variant="secondary" className="text-xs">Sekolah: {sekolah.nama}</Badge>
              {kelas && <Badge variant="outline" className="text-xs bg-muted/50">Kelas: {kelas.nama}</Badge>}
            </div>
          );
        }
        return <span className="text-xs text-muted-foreground">-</span>;
      }
    },
    {
      header: 'Status',
      accessorKey: 'isActive',
      sortable: true,
      cell: (u) => (
        u.isActive ? (
          <Badge variant="success" className="px-2 h-6 w-fit">Aktif</Badge>
        ) : (
          <Badge variant="destructive" className="px-2 h-6 w-fit">Nonaktif</Badge>
        )
      )
    },
    {
      header: 'Aksi',
      className: 'text-center sticky right-0 bg-white shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] min-w-[120px]',
      cell: (u) => (
        <div className="flex justify-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => startEdit(u)} title="Edit">
            <Edit size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-9 w-9 ${u.isActive ? 'text-destructive/80 hover:text-destructive hover:bg-destructive/10' : 'text-success hover:text-success/80 hover:bg-success/10'}`} 
            onClick={() => handleToggleActive(u.id, u.isActive)}
            title={u.isActive ? 'Nonaktifkan' : 'Aktifkan'}
          >
            {u.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
          </Button>
        </div>
      )
    }
  ];

  const renderEditRow = (u: any) => (
    <div className="flex flex-col sm:flex-row gap-4 p-2 bg-background rounded-lg border border-border shadow-sm">
      <div className="flex-1 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Nama Lengkap</label>
            <Input value={u.name} readOnly placeholder="Nama Lengkap" className="bg-muted/50 h-9" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Email Login</label>
            <Input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} placeholder="Email Login" className="h-9" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Role</label>
            <select 
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors" 
              value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}
            >
              <option value="ADMIN">ADMIN</option>
              <option value="TIM_DAPUR">TIM_DAPUR</option>
              <option value="GURU">GURU</option>
              <option value="PENERIMA_MANFAAT">PENERIMA_MANFAAT</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Password Baru</label>
            <Input type="password" value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} placeholder="Kosongkan jika tak diubah" className="h-9" />
          </div>
        </div>
        {editForm.role === 'PENERIMA_MANFAAT' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">NISN</label>
              <Input value={editForm.nisn} onChange={e => setEditForm({...editForm, nisn: e.target.value})} placeholder="NISN Siswa" className="h-9" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Pilih Kelas/Grup</label>
              <select 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors" 
                value={editForm.kelasId} onChange={e => setEditForm({...editForm, kelasId: e.target.value})}
              >
                <option value="">-- Pilih Kelas --</option>
                {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama} ({k.sekolah?.nama})</option>)}
              </select>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-row sm:flex-col justify-end gap-2 shrink-0">
        <Button size="sm" onClick={handleEdit} className="w-full">Simpan</Button>
        <Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="w-full">Batal</Button>
      </div>
    </div>
  );

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
        title="Manajemen User" 
        description="Kelola hak akses pengguna, pendaftaran, dan pemetaan akun."
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nama</label>
                  <Input placeholder="Masukkan nama lengkap" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required/>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Login</label>
                  <Input placeholder="email@contoh.com" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required/>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input placeholder="••••••••" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required/>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                    value={form.role} onChange={e => setForm({...form, role: e.target.value})} required
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="TIM_DAPUR">TIM_DAPUR</option>
                    <option value="GURU">GURU</option>
                    <option value="PENERIMA_MANFAAT">PENERIMA_MANFAAT</option>
                  </select>
                </div>
                
                {form.role === 'TIM_DAPUR' && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Pilih Dapur (Wajib)</label>
                    <select 
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                      value={form.dapurId} 
                      onChange={e => setForm({...form, dapurId: e.target.value})}
                      required
                    >
                      <option value="">-- Pilih Dapur --</option>
                      {dapurList.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
                    </select>
                  </div>
                )}

                {(form.role === 'GURU' || form.role === 'PENERIMA_MANFAAT') && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">
                      Pilih Sekolah (Wajib)
                    </label>
                    <select 
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                      value={form.sekolahId} 
                      onChange={e => setForm({...form, sekolahId: e.target.value, kelasId: ''})}
                      required
                    >
                      <option value="">-- Pilih Sekolah --</option>
                      {sekolahList.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                    </select>
                  </div>
                )}

                {form.role === 'PENERIMA_MANFAAT' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">NISN (Wajib)</label>
                      <Input placeholder="Nomor Induk Siswa Nasional" value={form.nisn} onChange={e => setForm({...form, nisn: e.target.value})} required/>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Pilih Kelas / Grup (Wajib)</label>
                      <select 
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                        value={form.kelasId} 
                        onChange={e => setForm({...form, kelasId: e.target.value})}
                        required
                        disabled={!form.sekolahId}
                      >
                        <option value="">-- Pilih Kelas --</option>
                        {kelasList.filter(k => k.sekolahId === form.sekolahId).map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                      </select>
                    </div>
                  </>
                )}
              </div>
              <div className="pt-2">
                <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                  {saving ? <><Loader2 size={16} className="mr-2 animate-spin" /> Menyimpan...</> : 'Simpan User'}
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
                     const csvContent = "data:text/csv;charset=utf-8,Nama Lengkap,Email,Password,Role,ID Sekolah,ID Dapur\nBudi Guru,budiguru@example.com,mbg12345,GURU,SEKOLAH_ID,\nTim Dapur B,dapurB@example.com,mbg12345,TIM_DAPUR,,DAPUR_ID";
                     const encodedUri = encodeURI(csvContent);
                     const link = document.createElement("a");
                     link.setAttribute("href", encodedUri);
                     link.setAttribute("download", "template_user.csv");
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
                        <strong>Baris {err.row} ({err.email || err.nama}):</strong> {err.message}
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
          <h3 className="font-bold text-xl text-foreground">Daftar User</h3>
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
              value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">Pilih Role</option>
              <option value="ADMIN">ADMIN</option>
              <option value="TIM_DAPUR">TIM_DAPUR</option>
              <option value="GURU">GURU</option>
              <option value="PENERIMA_MANFAAT">PENERIMA_MANFAAT</option>
            </select>
            <select 
              className="h-9 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors text-muted-foreground focus:text-foreground w-full sm:w-[160px]"
              value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Pilih Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Nonaktif</option>
            </select>
          </div>
        </div>

        {loading ? (
          <StateCard icon={<Loader2 size={32} className="animate-spin" />} title="Memuat Data" description="Mohon tunggu sebentar..." />
        ) : error ? (
          <StateCard icon={<Users size={32} />} title="Gagal Memuat" description={error} action={<Button variant="outline" onClick={loadData}>Coba Lagi</Button>} />
        ) : filteredUsers.length === 0 ? (
          <StateCard icon={<Users size={32} />} title="Belum Ada Data" description="Tidak ada user yang sesuai dengan filter." />
        ) : (
          <DataTable 
            data={filteredUsers}
            columns={columns}
            keyExtractor={(u) => u.id}
            editingRowId={editingId}
            renderEditRow={renderEditRow}
            defaultSort={{ key: 'name', direction: 'asc' }}
          />
        )}
      </div>
    </div>
  );
}
