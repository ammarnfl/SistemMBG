'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { Download, Loader2, FileText, CheckCircle2, Search, Filter, RefreshCw } from 'lucide-react';
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
      alert('Gagal mengunduh laporan.');
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
  ];

  const colsEvaluasi: Column<any>[] = [
    { header: 'Tanggal', cell: (row) => new Date(row.tanggal).toLocaleDateString('id-ID') },
    { header: 'Sekolah', accessorKey: 'distribusi.sekolah.nama' },
    { header: 'Nama Siswa', accessorKey: 'penerimaManfaat.name', className: 'font-semibold' },
    { header: 'Status', accessorKey: 'statusKonsumsi' },
    { header: 'Rating', cell: (row) => row.ratingKeseluruhan ? `${row.ratingKeseluruhan} ⭐` : '-' },
    { header: 'Menu', accessorKey: 'distribusi.menu.nama' },
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
    { header: 'Feedback', accessorKey: 'feedback', className: 'max-w-xs truncate' },
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
        <div className="border-b border-border/40 bg-card">
          <div className="flex overflow-x-auto p-1 scrollbar-none">
            {TAB_CONFIG.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as LaporanType)}
                className={`px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE HEADER & ACTIONS */}
        <div className="p-4 flex items-center justify-between bg-card">
          <div className="text-sm text-muted-foreground">
            Menampilkan {total} data <span className="font-semibold text-foreground capitalize">{activeTab}</span>
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
                    className="text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1"
                  >
                    Prev
                  </button>
                  <span className="text-sm font-medium px-4">
                    Halaman {page} dari {totalPages}
                  </span>
                  <button
                    onClick={() => loadData(Math.min(page + 1, totalPages))}
                    disabled={page === totalPages}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
