'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { PageHeader } from '../../../../components/layout/PageHeader';
import { StateCard } from '../../../../components/layout/StateCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Badge } from '../../../../components/ui/Badge';
import { DataTable, Column } from '../../../../components/ui/DataTable';
import { Plus, BookOpen, Loader2, Edit, Trash2, UtensilsCrossed, Info, Camera, CheckCircle2, X } from 'lucide-react';
// --- Types ---
interface Komponen {
  id: string;
  nama: string;
  deskripsi: string | null;
}

interface MenuKomponen {
  id: string;
  komponenMasterId: string | null;
  namaSnapshot: string;
}

interface Menu {
  id: string;
  nama: string;
  deskripsi: string | null;
  fotoUrl: string | null;
  energiKkal: number | null;
  proteinGram: number | null;
  lemakGram: number | null;
  karbohidratGram: number | null;
  seratGram: number | null;
  komponen: MenuKomponen[];
}

// --- Form Helpers ---
const FormField = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`space-y-1.5 ${className}`}>{children}</div>
);

const FormLabel = ({ children, required, className = '' }: { children: React.ReactNode, required?: boolean, className?: string }) => (
  <label className={`text-sm font-bold text-foreground flex gap-1 ${className}`}>
    {children}
    {required && <span className="text-destructive">*</span>}
  </label>
);

export default function DapurMenuPage() {
  const [activeTab, setActiveTab] = useState<'katalog' | 'komponen'>('katalog');
  
  // --- States for Data ---
  const [menus, setMenus] = useState<Menu[]>([]);
  const [komponenMaster, setKomponenMaster] = useState<Komponen[]>([]);
  
  const [loadingMenus, setLoadingMenus] = useState(true);
  const [loadingKomponen, setLoadingKomponen] = useState(true);
  const [error, setError] = useState('');

  // --- States for UI Modals/Forms ---
  const [isKomponenFormOpen, setIsKomponenFormOpen] = useState(false);
  const [komponenForm, setKomponenForm] = useState({ id: '', nama: '', deskripsi: '' });
  const [savingKomponen, setSavingKomponen] = useState(false);

  const [isMenuFormOpen, setIsMenuFormOpen] = useState(false);
  const [menuForm, setMenuForm] = useState<{
    id: string;
    nama: string;
    deskripsi: string;
    fotoUrl: string;
    energiKkal: string;
    proteinGram: string;
    lemakGram: string;
    karbohidratGram: string;
    seratGram: string;
    komponenIds: string[];
  }>({
    id: '', nama: '', deskripsi: '', fotoUrl: '', 
    energiKkal: '', proteinGram: '', lemakGram: '', karbohidratGram: '', seratGram: '',
    komponenIds: []
  });
  const [menuFotoFile, setMenuFotoFile] = useState<File | null>(null);
  const [savingMenu, setSavingMenu] = useState(false);
  
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);

  // --- Fetch Data ---
  const loadMenus = async () => {
    setLoadingMenus(true);
    try {
      const res = await fetch('/api/proxy/menu');
      if (!res.ok) throw new Error('Gagal memuat menu');
      const json = await res.json();
      setMenus(Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingMenus(false);
    }
  };

  const loadKomponen = async () => {
    setLoadingKomponen(true);
    try {
      const res = await fetch('/api/proxy/menu/komponen-master');
      if (!res.ok) throw new Error('Gagal memuat komponen master');
      const json = await res.json();
      setKomponenMaster(Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingKomponen(false);
    }
  };

  useEffect(() => {
    loadMenus();
    loadKomponen();
  }, []);

  // --- Handlers for Komponen ---
  const openAddKomponen = () => {
    setKomponenForm({ id: '', nama: '', deskripsi: '' });
    setIsKomponenFormOpen(true);
  };

  const openEditKomponen = (k: Komponen) => {
    setKomponenForm({ id: k.id, nama: k.nama, deskripsi: k.deskripsi || '' });
    setIsKomponenFormOpen(true);
  };

  const handleSaveKomponen = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingKomponen(true);
    try {
      const isEdit = !!komponenForm.id;
      const url = isEdit ? `/api/proxy/menu/komponen-master/${komponenForm.id}` : '/api/proxy/menu/komponen-master';
      const method = isEdit ? 'PUT' : 'POST';
      
      const payload = {
        nama: komponenForm.nama,
        deskripsi: komponenForm.deskripsi || undefined,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errJson = await res.json().catch(()=>({}));
        throw new Error(errJson.message || 'Gagal menyimpan komponen');
      }
      
      setIsKomponenFormOpen(false);
      loadKomponen();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSavingKomponen(false);
    }
  };

  const handleDeleteKomponen = async (id: string) => {
    if (!confirm('Hapus komponen ini?')) return;
    try {
      const res = await fetch(`/api/proxy/menu/komponen-master/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errJson = await res.json().catch(()=>({}));
        throw new Error(errJson.message || 'Gagal menghapus komponen');
      }
      loadKomponen();
    } catch (e: any) {
      alert(e.message);
    }
  };

  // --- Handlers for Menu ---
  const openAddMenu = () => {
    setMenuForm({
      id: '', nama: '', deskripsi: '', fotoUrl: '',
      energiKkal: '', proteinGram: '', lemakGram: '', karbohidratGram: '', seratGram: '',
      komponenIds: []
    });
    setMenuFotoFile(null);
    setIsMenuFormOpen(true);
  };

  const openEditMenu = (m: Menu) => {
    setMenuForm({
      id: m.id,
      nama: m.nama,
      deskripsi: m.deskripsi || '',
      fotoUrl: m.fotoUrl || '',
      energiKkal: m.energiKkal?.toString() || '',
      proteinGram: m.proteinGram?.toString() || '',
      lemakGram: m.lemakGram?.toString() || '',
      karbohidratGram: m.karbohidratGram?.toString() || '',
      seratGram: m.seratGram?.toString() || '',
      komponenIds: m.komponen.filter(k => k.komponenMasterId).map(k => k.komponenMasterId as string)
    });
    setMenuFotoFile(null);
    setIsMenuFormOpen(true);
  };

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (menuForm.komponenIds.length === 0) {
      alert('Pilih minimal 1 komponen untuk menu ini.');
      return;
    }

    setSavingMenu(true);
    try {
      const isEdit = !!menuForm.id;
      const url = isEdit ? `/api/proxy/menu/${menuForm.id}` : '/api/proxy/menu';
      const method = isEdit ? 'PUT' : 'POST';
      
      const payload: any = {
        nama: menuForm.nama,
        komponenIds: menuForm.komponenIds,
      };
      
      
      let finalFotoUrl = menuForm.fotoUrl;
      if (menuFotoFile) {
        const formData = new FormData();
        formData.append('file', menuFotoFile);
        const uploadRes = await fetch('/api/proxy/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadRes.ok) throw new Error('Gagal mengunggah foto menu');
        const uploadData = await uploadRes.json();
        finalFotoUrl = uploadData.data?.url || uploadData.url;
      }

      if (menuForm.deskripsi) payload.deskripsi = menuForm.deskripsi;
      if (finalFotoUrl) payload.fotoUrl = finalFotoUrl;
      if (menuForm.energiKkal) payload.energiKkal = Number(menuForm.energiKkal);
      if (menuForm.proteinGram) payload.proteinGram = Number(menuForm.proteinGram);
      if (menuForm.lemakGram) payload.lemakGram = Number(menuForm.lemakGram);
      if (menuForm.karbohidratGram) payload.karbohidratGram = Number(menuForm.karbohidratGram);
      if (menuForm.seratGram) payload.seratGram = Number(menuForm.seratGram);

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errJson = await res.json().catch(()=>({}));
        throw new Error(errJson.message || 'Gagal menyimpan menu');
      }
      
      setIsMenuFormOpen(false);
      loadMenus();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSavingMenu(false);
    }
  };

  const handleDeleteMenu = async (id: string) => {
    if (!confirm('Hapus menu ini?')) return;
    try {
      const res = await fetch(`/api/proxy/menu/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errJson = await res.json().catch(()=>({}));
        throw new Error(errJson.message || 'Gagal menghapus menu');
      }
      loadMenus();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const toggleKomponenSelection = (kompId: string) => {
    setMenuForm(prev => {
      if (prev.komponenIds.includes(kompId)) {
        return { ...prev, komponenIds: prev.komponenIds.filter(id => id !== kompId) };
      } else {
        return { ...prev, komponenIds: [...prev.komponenIds, kompId] };
      }
    });
  };

  // --- Columns Definitions ---
  const komponenCols: Column<Komponen>[] = [
    { header: 'Nama Komponen', accessorKey: 'nama', sortable: true, className: 'font-semibold' },
    { header: 'Deskripsi', accessorKey: 'deskripsi', cell: (row) => row.deskripsi || <span className="text-muted-foreground italic">Tidak ada deskripsi</span> },
    {
      header: 'Aksi',
      cell: (row) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => openEditKomponen(row)}>Edit</Button>
          <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleDeleteKomponen(row.id)}>Hapus</Button>
        </div>
      ),
    }
  ];

  const menuCols: Column<Menu>[] = [
    {
      header: 'Foto',
      cell: (row) => row.fotoUrl ? (
        <img 
          src={row.fotoUrl} 
          alt={row.nama} 
          className="w-12 h-12 rounded-md object-cover border cursor-pointer hover:opacity-80 transition hover:ring-2 ring-primary/50" 
          onClick={() => setPreviewFoto(row.fotoUrl)}
          title="Klik untuk memperbesar"
        />
      ) : (
        <div className="w-12 h-12 rounded-md bg-muted/50 flex items-center justify-center border text-muted-foreground">
          <UtensilsCrossed size={16} />
        </div>
      )
    },
    { header: 'Nama Menu', accessorKey: 'nama', sortable: true, className: 'font-bold text-base' },
    {
      header: 'Komposisi',
      cell: (row) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {row.komponen.length > 0 ? row.komponen.map(k => (
            <Badge key={k.id} variant="secondary" className="text-[10px] font-normal">{k.namaSnapshot}</Badge>
          )) : <span className="text-xs text-muted-foreground">Belum ada komposisi</span>}
        </div>
      )
    },
    {
      header: 'Nilai Gizi',
      cell: (row) => (
        <div className="text-xs space-y-1 text-muted-foreground">
          {row.energiKkal !== null ? <div><span className="font-medium text-foreground">{row.energiKkal}</span> kkal</div> : null}
          {row.proteinGram !== null ? <div>P: {row.proteinGram}g | L: {row.lemakGram}g | K: {row.karbohidratGram}g</div> : <div><span className="italic">Belum diisi</span></div>}
        </div>
      )
    },
    {
      header: 'Aksi',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Link href={`/dapur/menu/${row.id}`}>
            <Button variant="outline" size="sm">Detail</Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => openEditMenu(row)}>Edit</Button>
          <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleDeleteMenu(row.id)}>
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <PageHeader 
        title="Pengelolaan Menu Master" 
        description="Kelola komponen bahan dasar dan buat menu masakan yang akan didistribusikan."
      />

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-sm font-medium">
          {error}
        </div>
      )}

      {/* TABS */}
      <div className="flex gap-2 p-1 bg-muted/40 rounded-xl w-fit border border-border/50">
        <button
          onClick={() => setActiveTab('katalog')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'katalog' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:bg-white/50'
          }`}
        >
          Katalog Menu
        </button>
        <button
          onClick={() => setActiveTab('komponen')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'komponen' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:bg-white/50'
          }`}
        >
          Daftar Komponen
        </button>
      </div>

      {/* TAB CONTENT: KATALOG MENU */}
      {activeTab === 'katalog' && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40">
            <div>
              <CardTitle>Daftar Menu</CardTitle>
              <CardDescription>Menu masakan yang siap dijadwalkan.</CardDescription>
            </div>
            <Button onClick={openAddMenu} className="gap-2 shadow-sm">
              <Plus size={16} /> Tambah Menu Baru
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loadingMenus ? (
              <div className="p-12 flex justify-center text-muted-foreground"><Loader2 className="animate-spin" /></div>
            ) : (
              <DataTable
                data={menus}
                columns={menuCols}
                keyExtractor={(row) => row.id}
                emptyMessage="Belum ada menu yang ditambahkan. Silakan tambah menu baru."
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB CONTENT: DAFTAR KOMPONEN */}
      {activeTab === 'komponen' && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40">
            <div>
              <CardTitle>Master Komponen Bahan</CardTitle>
              <CardDescription>Bahan makanan yang dapat digabungkan menjadi sebuah menu.</CardDescription>
            </div>
            <Button onClick={openAddKomponen} className="gap-2 shadow-sm">
              <Plus size={16} /> Tambah Komponen
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loadingKomponen ? (
              <div className="p-12 flex justify-center text-muted-foreground"><Loader2 className="animate-spin" /></div>
            ) : (
              <DataTable
                data={komponenMaster}
                columns={komponenCols}
                keyExtractor={(row) => row.id}
                emptyMessage="Belum ada komponen bahan. Tambahkan komponen sebelum membuat menu."
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* MODAL: FORM KOMPONEN */}
      {isKomponenFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle>{komponenForm.id ? 'Edit Komponen' : 'Tambah Komponen Baru'}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSaveKomponen} className="space-y-4">
                <FormField>
                  <FormLabel required>Nama Komponen</FormLabel>
                  <Input 
                    placeholder="Contoh: Nasi Putih / Ayam Teriyaki" 
                    value={komponenForm.nama} 
                    onChange={e => setKomponenForm({...komponenForm, nama: e.target.value})} 
                    required autoFocus
                  />
                </FormField>
                <FormField>
                  <FormLabel>Deskripsi</FormLabel>
                  <Input 
                    placeholder="Keterangan singkat atau takaran porsi dasar..." 
                    value={komponenForm.deskripsi} 
                    onChange={e => setKomponenForm({...komponenForm, deskripsi: e.target.value})} 
                  />
                </FormField>
                <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                  <Button type="button" variant="ghost" onClick={() => setIsKomponenFormOpen(false)}>Batal</Button>
                  <Button type="submit" disabled={savingKomponen}>
                    {savingKomponen ? <Loader2 size={16} className="animate-spin" /> : 'Simpan'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL: FORM MENU */}
      {isMenuFormOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto animate-in fade-in">
          <div className="my-8 w-full max-w-3xl">
            <Card className="shadow-2xl">
              <CardHeader className="pb-4 border-b border-border/40 sticky top-0 bg-card z-10 rounded-t-xl">
                <CardTitle>{menuForm.id ? 'Edit Menu' : 'Tambah Menu Baru'}</CardTitle>
                <CardDescription>Lengkapi detail menu, komposisi bahan, dan nilai gizi per porsi.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSaveMenu} className="space-y-8">
                  
                  {/* Bagian 1: Info Dasar */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">1</div>
                      Informasi Dasar
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8">
                      <FormField className="md:col-span-2">
                        <FormLabel required>Nama Menu</FormLabel>
                        <Input 
                          placeholder="Contoh: Nasi Goreng Spesial" 
                          value={menuForm.nama} 
                          onChange={e => setMenuForm({...menuForm, nama: e.target.value})} 
                          required 
                        />
                      </FormField>
                      <FormField className="md:col-span-2">
                        <FormLabel>Deskripsi Menu</FormLabel>
                        <Input 
                          placeholder="Penjelasan singkat mengenai menu ini..." 
                          value={menuForm.deskripsi} 
                          onChange={e => setMenuForm({...menuForm, deskripsi: e.target.value})} 
                        />
                      </FormField>
                      <FormField className="md:col-span-2">
                        <FormLabel>Foto Makanan (Opsional)</FormLabel>
                        <div className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center bg-muted/10 hover:bg-muted/30 transition-colors">
                          <input 
                            type="file" 
                            accept="image/*" 
                            id="menu-foto-upload" 
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setMenuFotoFile(e.target.files[0]);
                                // Clear string url so we use the file instead
                                setMenuForm(prev => ({...prev, fotoUrl: ''}));
                              }
                            }}
                          />
                          <label htmlFor="menu-foto-upload" className="cursor-pointer flex flex-col items-center w-full">
                            {menuFotoFile ? (
                              <>
                                <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                                <span className="text-sm font-medium text-foreground">{menuFotoFile.name}</span>
                                <span className="text-xs text-muted-foreground mt-1 underline">Ganti Foto</span>
                              </>
                            ) : menuForm.fotoUrl ? (
                              <div className="flex flex-col items-center">
                                <div className="mt-2 rounded-xl overflow-hidden border w-24 h-24 relative group mb-2">
                                  <img src={menuForm.fotoUrl} className="w-full h-full object-cover" alt="Preview" />
                                </div>
                                <span className="text-xs text-muted-foreground underline">Ganti Foto</span>
                              </div>
                            ) : (
                              <>
                                <div className="p-3 bg-primary/10 rounded-full mb-3 text-primary">
                                  <Camera className="h-6 w-6" />
                                </div>
                                <span className="text-sm font-medium">Ketuk untuk Unggah Foto</span>
                                <span className="text-xs text-muted-foreground mt-1">Format JPG, PNG (Maks 2MB)</span>
                              </>
                            )}
                          </label>
                        </div>
                      </FormField>
                    </div>
                  </div>

                  {/* Bagian 2: Komposisi */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">2</div>
                      Komposisi (Pilih Minimal 1)
                    </h3>
                    <div className="ml-8 border border-border/50 rounded-xl p-4 bg-muted/20">
                      {komponenMaster.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground text-sm">
                          <p>Belum ada komponen yang tersedia.</p>
                          <p className="mt-1">Silakan simpan komponen terlebih dahulu di tab <b>Daftar Komponen</b>.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {komponenMaster.map(komp => {
                            const isSelected = menuForm.komponenIds.includes(komp.id);
                            return (
                              <div 
                                key={komp.id}
                                onClick={() => toggleKomponenSelection(komp.id)}
                                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                                  isSelected 
                                    ? 'bg-primary/5 border-primary/40 ring-1 ring-primary/20' 
                                    : 'bg-card border-border/40 hover:border-primary/30'
                                }`}
                              >
                                <div className={`w-5 h-5 mt-0.5 rounded flex items-center justify-center border ${isSelected ? 'bg-primary border-primary text-white' : 'border-input bg-background'}`}>
                                  {isSelected && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-bold truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>{komp.nama}</p>
                                  {komp.deskripsi && <p className="text-[10px] text-muted-foreground truncate">{komp.deskripsi}</p>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <div className="mt-4 flex items-center gap-2 text-xs font-medium">
                        <span className="px-2 py-1 bg-muted rounded-md border text-muted-foreground">Terpilih: {menuForm.komponenIds.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bagian 3: Nilai Gizi */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">3</div>
                      Kandungan Gizi (Per Porsi Menu)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 ml-8">
                      <FormField>
                        <FormLabel>Energi (kkal)</FormLabel>
                        <Input type="number" min="0" placeholder="0" value={menuForm.energiKkal} onChange={e => setMenuForm({...menuForm, energiKkal: e.target.value})} />
                      </FormField>
                      <FormField>
                        <FormLabel>Protein (gram)</FormLabel>
                        <Input type="number" min="0" placeholder="0" value={menuForm.proteinGram} onChange={e => setMenuForm({...menuForm, proteinGram: e.target.value})} />
                      </FormField>
                      <FormField>
                        <FormLabel>Lemak (gram)</FormLabel>
                        <Input type="number" min="0" placeholder="0" value={menuForm.lemakGram} onChange={e => setMenuForm({...menuForm, lemakGram: e.target.value})} />
                      </FormField>
                      <FormField>
                        <FormLabel>Karbo. (gram)</FormLabel>
                        <Input type="number" min="0" placeholder="0" value={menuForm.karbohidratGram} onChange={e => setMenuForm({...menuForm, karbohidratGram: e.target.value})} />
                      </FormField>
                      <FormField>
                        <FormLabel>Serat (gram)</FormLabel>
                        <Input type="number" min="0" placeholder="0" value={menuForm.seratGram} onChange={e => setMenuForm({...menuForm, seratGram: e.target.value})} />
                      </FormField>
                    </div>
                    <div className="ml-8 mt-2 p-3 rounded-lg bg-blue-50/50 border border-blue-100 flex gap-2 text-xs text-blue-700">
                      <Info size={14} className="shrink-0 mt-0.5" />
                      <p>Isi 0 jika nilai gizi belum diketahui. Nilai ini mewakili keseluruhan 1 porsi menu, bukan dijumlahkan otomatis dari komponen.</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-border/40 mt-8 sticky bottom-0 bg-card py-4 z-10 rounded-b-xl">
                    <Button type="button" variant="ghost" onClick={() => setIsMenuFormOpen(false)}>Batal</Button>
                    <Button type="submit" disabled={savingMenu || menuForm.komponenIds.length === 0}>
                      {savingMenu ? <Loader2 size={16} className="animate-spin" /> : 'Simpan Menu'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* MODAL: IMAGE PREVIEW */}
      {previewFoto && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 animate-in fade-in" onClick={() => setPreviewFoto(null)}>
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button 
              className="absolute -top-12 right-0 md:-right-12 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-all"
              onClick={() => setPreviewFoto(null)}
            >
              <X size={24} />
            </button>
            <img 
              src={previewFoto} 
              alt="Preview Menu" 
              className="w-full h-full object-contain rounded-xl shadow-2xl border border-white/10" 
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

    </div>
  );
}
