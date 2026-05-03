'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '../../../../components/layout/PageHeader';
import { StateCard } from '../../../../components/layout/StateCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Badge } from '../../../../components/ui/Badge';
import { ArrowLeft, UserPlus, Users, Loader2, Edit, UserX, UserCheck, Plus, FileSpreadsheet, Upload, AlertCircle } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [dapurList, setDapurList] = useState<any[]>([]);
  const [sekolahList, setSekolahList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [tab, setTab] = useState<'SINGLE' | 'BATCH'>('SINGLE');
  const [batchErrors, setBatchErrors] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resUsers, resDapur, resSekolah] = await Promise.all([
        fetch('/api/proxy/admin-users'),
        fetch('/api/proxy/dapur'),
        fetch('/api/proxy/sekolah')
      ]);
      if (!resUsers.ok) throw new Error('Gagal mengambil data user');
      const dataUsers = await resUsers.json();
      const dataDapur = await resDapur.json();
      const dataSekolah = await resSekolah.json();
      
      setUsers(dataUsers.data || []);
      setDapurList(dataDapur.data || []);
      setSekolahList(dataSekolah.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'GURU', dapurId: '', sekolahId: '' });
  const [saving, setSaving] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', role: '', password: '', email: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = { ...form };
      if (form.role !== 'TIM_DAPUR') delete payload.dapurId;
      if (form.role !== 'GURU') delete payload.sekolahId;
      
      const res = await fetch('/api/proxy/admin-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.message || 'Gagal simpan user');
      }
      setForm({ name: '', email: '', password: '', role: 'GURU', dapurId: '', sekolahId: '' });
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
    setEditForm({ name: u.name, role: u.role, password: '', email: u.email });
  };

  const handleEdit = async () => {
    if (!editingId) return;
    try {
      const payload: any = { name: editForm.name, role: editForm.role, email: editForm.email };
      if (editForm.password) payload.password = editForm.password;
      
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

  const filteredUsers = roleFilter === 'ALL' ? users : users.filter(u => u.role === roleFilter);

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
                    <label className="text-sm font-medium">Pilih Dapur (Opsional)</label>
                    <select 
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                      value={form.dapurId} onChange={e => setForm({...form, dapurId: e.target.value})}
                    >
                      <option value="">-- Buat akun saja, tanpa dapur --</option>
                      {dapurList.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
                    </select>
                  </div>
                )}

                {form.role === 'GURU' && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Pilih Sekolah (Opsional)</label>
                    <select 
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                      value={form.sekolahId} onChange={e => setForm({...form, sekolahId: e.target.value})}
                    >
                      <option value="">-- Buat akun saja, tanpa sekolah --</option>
                      {sekolahList.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                    </select>
                  </div>
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
                     const csvContent = "data:text/csv;charset=utf-8,Nama Lengkap,Email,Password,Role,ID Sekolah (Opsional),ID Dapur (Opsional)\nBudi Guru,budiguru@example.com,mbg12345,GURU,SEKOLAH_ID_OPSIONAL,\nTim Dapur B,dapurB@example.com,mbg12345,TIM_DAPUR,,DAPUR_ID_OPSIONAL";
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1 mb-2">
          <h3 className="font-bold text-lg text-foreground">Daftar User</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Filter Role:</span>
            <select 
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
              value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">Semua Role</option>
              <option value="ADMIN">ADMIN</option>
              <option value="TIM_DAPUR">TIM_DAPUR</option>
              <option value="GURU">GURU</option>
              <option value="PENERIMA_MANFAAT">PENERIMA_MANFAAT</option>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredUsers.map((u, i) => (
              <Card key={i} className={`flex flex-col ${!u.isActive ? 'opacity-70' : ''}`}>
                <CardContent className="p-6 flex-1 flex flex-col gap-4">
                  {editingId === u.id ? (
                    <div className="space-y-3">
                      <Input value={u.name} readOnly placeholder="Nama Lengkap" className="bg-muted/50" />
                      <Input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} placeholder="Email Login" />
                      <select 
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors" 
                        value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="TIM_DAPUR">TIM_DAPUR</option>
                        <option value="GURU">GURU</option>
                        <option value="PENERIMA_MANFAAT">PENERIMA_MANFAAT</option>
                      </select>
                      <Input type="password" value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} placeholder="Password Baru (Kosongkan jika tak diubah)" />
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" onClick={handleEdit}>Simpan</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Batal</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="font-bold text-foreground text-lg truncate" title={u.name}>{u.name}</div>
                          <div className="text-sm font-medium text-primary bg-primary/5 p-2 px-3 rounded-lg border border-primary/10 inline-block truncate max-w-full">
                            {u.email}
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0 pt-1">
                          {u.isActive ? (
                            <Badge variant="success" className="px-2 h-6">Aktif</Badge>
                          ) : (
                            <Badge variant="destructive" className="px-2 h-6">Nonaktif</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/60">
                        <Badge variant="outline" className="bg-secondary/40 text-xs px-2 h-6">{u.role}</Badge>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="h-9 px-3 text-muted-foreground" onClick={() => startEdit(u)}>
                            <Edit size={16} className="mr-1" /> Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`h-9 px-3 ${u.isActive ? 'text-destructive/90 hover:text-destructive' : 'text-success'}`} 
                            onClick={() => handleToggleActive(u.id, u.isActive)}
                          >
                            {u.isActive ? <><UserX size={16} className="mr-1" /> Matikan</> : <><UserCheck size={16} className="mr-1" /> Aktifkan</>}
                          </Button>
                        </div>
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
