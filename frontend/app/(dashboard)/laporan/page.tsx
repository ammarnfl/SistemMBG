'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { Tabs } from '../../../components/ui/Tabs';
import { SentimentBadge } from '../../../components/ui/SentimentBadge';
import { toast } from '../../../components/ui/Toast';
import { ImageLightbox } from '../../../components/ui/ImageLightbox';
import { Download, Loader2, FileText, CheckCircle2, Search, Filter, RefreshCw, Camera, X, ZoomIn, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
function resolveImgUrl(url: string) {
  return url.startsWith('http') ? url : `${BACKEND_URL}${url}`;
}
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

type LaporanType = 'distribusi' | 'evaluasi' | 'komponen' | 'feedback';

const TAB_CONFIG = [
  { id: 'distribusi', label: 'Distribusi' },
  { id: 'evaluasi', label: 'Evaluasi Konsumsi' },
  { id: 'komponen', label: 'Keterhabisan Komponen' },
  { id: 'feedback', label: 'Feedback' },
];

export default function LaporanPage() {
  const [activeTab, setActiveTab] = useState<LaporanType>('distribusi');
  
  // Filters
  const [tanggalAwal, setTanggalAwal] = useState('');
  const [tanggalAkhir, setTanggalAkhir] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  // Data states
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Export states
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [selectedFotoUrl, setSelectedFotoUrl] = useState<string | null>(null);
  const [lastSentimenRefresh, setLastSentimenRefresh] = useState<string | null>(null);

  // Warna sentimen via components/ui/SentimentBadge

  const buildQueryString = useCallback((pageNum = 1) => {
    const params = new URLSearchParams();
    params.set('page', pageNum.toString());
    if (tanggalAwal) params.set('tanggalAwal', tanggalAwal);
    if (tanggalAkhir) params.set('tanggalAkhir', tanggalAkhir);
    if (debouncedSearch) params.set('search', debouncedSearch);
    return params.toString();
  }, [tanggalAwal, tanggalAkhir, debouncedSearch]);

  const loadData = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const qs = buildQueryString(pageNum);
      const res = await fetch(`/api/proxy/laporan/${activeTab}/data?${qs}`);
      if (!res.ok) throw new Error('Gagal memuat data laporan');
      
      const json = await res.json();
      const result = json.data || {};
      
      setData(Array.isArray(result.data) ? result.data : []);
      setTotal(result.total || 0);
      setPage(result.page || 1);
      setTotalPages(result.totalPages || 1);
      if (result.lastSentimenRefresh) {
        setLastSentimenRefresh(result.lastSentimenRefresh);
      }
    } catch (err: any) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, buildQueryString]);

  useEffect(() => {
    loadData(1);
  }, [activeTab, debouncedSearch, loadData]);

  const handleApplyFilter = () => {
    loadData(1);
  };

  const handleResetFilter = () => {
    setTanggalAwal('');
    setTanggalAkhir('');
    setSearch('');
    // Data reload is handled by effect when debouncedSearch clears
    if (!search) loadData(1);
  };

  const downloadCsv = async () => {
    setDownloading(true);
    setDownloaded(false);
    try {
      const qs = buildQueryString(1); // include filters but omit page limit in backend
      const res = await fetch(`/api/proxy/laporan/${activeTab}?${qs}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan-${activeTab}-${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      toast.error('Gagal mengunduh laporan.');
    } finally {
      setDownloading(false);
    }
  };

  // --- Columns Configuration ---
  const colsDistribusi: Column<any>[] = [
    { header: 'Tanggal', cell: (row) => new Date(row.tanggal).toLocaleDateString('id-ID') },
    { header: 'Dapur', accessorKey: 'dapur.nama' },
    { header: 'Sekolah', accessorKey: 'sekolah.nama', className: 'font-semibold' },
    { header: 'Menu', accessorKey: 'menu.nama' },
    { header: 'Porsi', accessorKey: 'jumlahPorsi' },
    { header: 'Status', accessorKey: 'status' },
    { 
      header: 'Keterangan Dapur', 
      cell: (row) => (row.status === 'BERMASALAH' && row.catatanDapur) ? 
        <span className="text-destructive font-medium truncate max-w-[200px] inline-block" title={row.catatanDapur}>{row.catatanDapur}</span> : 
        <span className="text-muted-foreground">-</span>
    },
    { 
      header: 'Keterangan Guru', 
      cell: (row) => (row.status === 'BERMASALAH' && row.catatanGuru) ? 
        <span className="text-destructive font-medium truncate max-w-[200px] inline-block" title={row.catatanGuru}>{row.catatanGuru}</span> : 
        <span className="text-muted-foreground">-</span>
    },
  ];

  const colsEvaluasi: Column<any>[] = [
    { header: 'Tanggal', cell: (row) => new Date(row.tanggal).toLocaleDateString('id-ID') },
    { header: 'Sekolah', accessorKey: 'distribusi.sekolah.nama' },
    { header: 'Nama Siswa', accessorKey: 'penerimaManfaat.name', className: 'font-semibold' },
    { header: 'Status', accessorKey: 'statusKonsumsi' },
    { header: 'Rating', cell: (row) => row.ratingKeseluruhan ? `${row.ratingKeseluruhan} ⭐` : '-' },
    { header: 'Menu', accessorKey: 'distribusi.menu.nama' },
    { 
      header: 'Keterangan', 
      cell: (row) => {
        if (row.statusKonsumsi === 'SISA' || row.statusKonsumsi === 'TIDAK_DIMAKAN') {
          return <span className="text-amber-600 font-medium truncate max-w-[250px] inline-block" title={row.feedback || ''}>{row.feedback || 'Perlu evaluasi'}</span>;
        }
        return <span className="text-muted-foreground">-</span>;
      }
    },
    { header: 'Foto', cell: (row) => row.fotoUrl ? (
      <button
        onClick={() => setSelectedFotoUrl(resolveImgUrl(row.fotoUrl))}
        className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-md hover:bg-primary/20 transition-colors"
      >
        <Camera size={12} /><ZoomIn size={12} />
      </button>
    ) : <span className="text-muted-foreground/40 text-xs">—</span> },
  ];

  const colsKomponen: Column<any>[] = [
    { header: 'Tanggal', cell: (row) => row.evaluasi?.tanggal ? new Date(row.evaluasi.tanggal).toLocaleDateString('id-ID') : '-' },
    { header: 'Sekolah', cell: (row) => row.evaluasi?.distribusi?.sekolah?.nama || '-' },
    { header: 'Siswa', cell: (row) => row.evaluasi?.penerimaManfaat?.name || '-' },
    { header: 'Komponen', cell: (row) => row.komponen?.namaSnapshot || '-', className: 'font-semibold' },
    { header: 'Skor Keterhabisan', accessorKey: 'skorKeterhabisan' },
  ];

  const colsFeedback: Column<any>[] = [
    { header: 'Tanggal', cell: (row) => new Date(row.tanggal).toLocaleDateString('id-ID') },
    { header: 'Siswa', accessorKey: 'penerimaManfaat.name', className: 'font-semibold' },
    { header: 'Sekolah', accessorKey: 'distribusi.sekolah.nama' },
    { header: 'Menu', accessorKey: 'distribusi.menu.nama' },
    { header: 'Rating', cell: (row) => row.ratingKeseluruhan ? `${row.ratingKeseluruhan} ⭐` : '-' },
    { header: 'Label', cell: (row) => <SentimentBadge sentimen={row.sentimen} /> },
    { header: 'Feedback', accessorKey: 'feedback', className: 'max-w-xs truncate' },
    { header: 'Foto', cell: (row) => row.fotoUrl ? (
      <button
        onClick={() => setSelectedFotoUrl(resolveImgUrl(row.fotoUrl))}
        className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-md hover:bg-primary/20 transition-colors"
      >
        <Camera size={12} /><ZoomIn size={12} />
      </button>
    ) : <span className="text-muted-foreground/40 text-xs">—</span> },
  ];

  const currentColumns = 
    activeTab === 'distribusi' ? colsDistribusi :
    activeTab === 'evaluasi' ? colsEvaluasi :
    activeTab === 'komponen' ? colsKomponen :
    colsFeedback;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <PageHeader
        title="Laporan & Ekspor Data"
        description="Pantau dan unduh berbagai laporan performa sistem MBG."
      />

      {/* HEADER SECTION: Filter & Search */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <div className="bg-muted/30 border-b border-border/40 p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full relative">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Pencarian
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Cari nama sekolah, siswa, atau menu..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full bg-white"
                />
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Dari Tanggal
                </label>
                <Input
                  type="date"
                  value={tanggalAwal}
                  onChange={(e) => setTanggalAwal(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Sampai Tanggal
                </label>
                <Input
                  type="date"
                  value={tanggalAkhir}
                  onChange={(e) => setTanggalAkhir(e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleResetFilter} className="gap-2">
                <RefreshCw size={14} /> Reset
              </Button>
              <Button onClick={handleApplyFilter} className="gap-2">
                <Filter size={14} /> Filter
              </Button>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="bg-card">
          <Tabs
            variant="underline"
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as LaporanType)}
            items={TAB_CONFIG.map((t) => ({ value: t.id, label: t.label }))}
          />
        </div>

        {/* TABLE HEADER & ACTIONS */}
        <div className="p-4 flex items-center justify-between bg-card">
          <div className="text-sm text-muted-foreground">
            Menampilkan {total} data <span className="font-semibold text-foreground capitalize">{activeTab}</span>
            {activeTab === 'feedback' && lastSentimenRefresh && (
              <span className="ml-3 inline-flex items-center gap-1.5 text-[10px] text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full border border-border/40">
                <Clock size={10} />
                Label diperbarui: {new Date(lastSentimenRefresh).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <Button
            variant="outline"
            onClick={downloadCsv}
            disabled={downloading || total === 0}
            className={`gap-2 ${downloaded ? 'bg-green-50 text-green-700 border-green-200' : ''}`}
          >
            {downloading ? (
              <><Loader2 size={14} className="animate-spin" /> Ekspor...</>
            ) : downloaded ? (
              <><CheckCircle2 size={14} /> Berhasil</>
            ) : (
              <><Download size={14} /> Ekspor CSV</>
            )}
          </Button>
        </div>

        {/* DATA TABLE */}
        <div className="px-4 pb-4 bg-card">
          {loading ? (
            <div className="py-24 flex justify-center text-muted-foreground">
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : (
            <div className="border rounded-xl overflow-hidden">
              <DataTable
                data={data}
                columns={currentColumns}
                keyExtractor={(row) => row.id}
                emptyMessage="Tidak ada data ditemukan dengan filter saat ini."
              />
              
              {/* Custom Pagination Footer because we fetch paginated from backend */}
              {totalPages > 1 && (
                <div className="flex items-center justify-end px-6 py-4 border-t border-border/60 gap-1 bg-white">
                  <button
                    onClick={() => loadData(Math.max(page - 1, 1))}
                    disabled={page === 1}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center mr-3 transition-colors"
                  >
                    <ChevronLeft size={16} className="mr-1" /> Prev
                  </button>
                  
                  {(() => {
                    const pages = [];
                    if (totalPages <= 5) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      if (page <= 3) {
                        pages.push(1, 2, 3, 4, '...', totalPages);
                      } else if (page >= totalPages - 2) {
                        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                      } else {
                        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
                      }
                    }
                    return pages.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => typeof p === 'number' && loadData(p)}
                        disabled={p === '...'}
                        className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                          p === page
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : p === '...'
                            ? 'text-muted-foreground cursor-default'
                            : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                        }`}
                      >
                        {p}
                      </button>
                    ));
                  })()}

                  <button
                    onClick={() => loadData(Math.min(page + 1, totalPages))}
                    disabled={page === totalPages}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center ml-3 transition-colors"
                  >
                    Next <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <ImageLightbox src={selectedFotoUrl} alt="Foto evaluasi siswa" onClose={() => setSelectedFotoUrl(null)} />
    </div>
  );
}
