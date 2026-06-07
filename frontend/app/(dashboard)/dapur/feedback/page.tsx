'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../../../../components/layout/PageHeader';
import { Card, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Badge } from '../../../../components/ui/Badge';
import { Select } from '../../../../components/ui/Select';
import { SentimentBadge } from '../../../../components/ui/SentimentBadge';
import { toast } from '../../../../components/ui/Toast';
import {
  Loader2, Search, Filter, RefreshCw, MessageSquare, CheckCircle2,
  ChevronLeft, ChevronRight, X, ArrowLeft, Calendar, School, Tag,
  User, UtensilsCrossed, GraduationCap,
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  feedback: string;
  tanggal: string;
  sentimen: 'POSITIF' | 'NETRAL' | 'NEGATIF' | null;
  sentimenSkor: number | null;
  ratingKeseluruhan: number | null;
  feedbackResolved: boolean;
  feedbackResolution: string | null;
  feedbackResolvedAt: string | null;
  kategori?: string[];
  penerimaManfaat: { name: string };
  distribusi: {
    sekolah: { id: string; nama: string } | null;
    menu: { nama: string } | null;
  } | null;
  feedbackResolvedBy: { name: string } | null;
}

interface SekolahOption {
  id: string;
  nama: string;
}

// SentimentBadge & SENTIMEN_CONFIG dipindah ke components/ui/SentimentBadge

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function DapurFeedbackPage() {
  const [data, setData] = useState<FeedbackItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [tanggalAwal, setTanggalAwal] = useState('');
  const [tanggalAkhir, setTanggalAkhir] = useState('');
  const [sentimen, setSentimen] = useState('');
  const [sekolahId, setSekolahId] = useState('');
  const [resolvedFilter, setResolvedFilter] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('');

  // Sekolah dropdown
  const [sekolahList, setSekolahList] = useState<SekolahOption[]>([]);

  // Resolve modal state
  const [resolveTarget, setResolveTarget] = useState<FeedbackItem | null>(null);
  const [resolveText, setResolveText] = useState('');
  const [resolving, setResolving] = useState(false);

  // Tab: 'siswa' (feedback siswa) | 'guru' (observasi guru)
  const [activeTab, setActiveTab] = useState<'siswa' | 'guru'>('siswa');
  const [observasi, setObservasi] = useState<any[]>([]);
  const [obsLoading, setObsLoading] = useState(false);
  const [obsSekolahId, setObsSekolahId] = useState('');
  const [obsTanggal, setObsTanggal] = useState('');

  const loadObservasi = useCallback(async () => {
    setObsLoading(true);
    try {
      const params = new URLSearchParams();
      if (obsSekolahId) params.set('sekolahId', obsSekolahId);
      if (obsTanggal) params.set('tanggal', obsTanggal);
      const res = await fetch(`/api/proxy/observasi?${params.toString()}`);
      if (!res.ok) throw new Error('Gagal memuat');
      const json = await res.json();
      const result = json?.data ?? json;
      setObservasi(Array.isArray(result) ? result : []);
    } catch {
      setObservasi([]);
    } finally {
      setObsLoading(false);
    }
  }, [obsSekolahId, obsTanggal]);

  useEffect(() => {
    if (activeTab === 'guru') loadObservasi();
  }, [activeTab, loadObservasi]);

  // Load sekolah list once
  useEffect(() => {
    fetch('/api/proxy/feedback/sekolah')
      .then((r) => r.ok ? r.json() : [])
      .then((json) => {
        const list = json?.data ?? json;
        setSekolahList(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
  }, []);

  const loadData = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', p.toString());
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (tanggalAwal) params.set('tanggalAwal', tanggalAwal);
      if (tanggalAkhir) params.set('tanggalAkhir', tanggalAkhir);
      if (sentimen) params.set('sentimen', sentimen);
      if (sekolahId) params.set('sekolahId', sekolahId);
      if (resolvedFilter) params.set('resolved', resolvedFilter);
      if (kategoriFilter) params.set('kategori', kategoriFilter);

      const res = await fetch(`/api/proxy/feedback?${params.toString()}`);
      if (!res.ok) throw new Error('Gagal memuat');
      const json = await res.json();
      const result = json.data || json;
      setData(Array.isArray(result.data) ? result.data : []);
      setTotal(result.total || 0);
      setPage(result.page || 1);
      setTotalPages(result.totalPages || 1);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, tanggalAwal, tanggalAkhir, sentimen, sekolahId, resolvedFilter, kategoriFilter]);

  useEffect(() => {
    loadData(1);
  }, [loadData]);

  const resetFilters = () => {
    setSearch('');
    setTanggalAwal('');
    setTanggalAkhir('');
    setSentimen('');
    setSekolahId('');
    setResolvedFilter('');
    setKategoriFilter('');
  };

  const hasFilters = search || tanggalAwal || tanggalAkhir || sentimen || sekolahId || resolvedFilter || kategoriFilter;

  const handleResolve = async () => {
    if (!resolveTarget || !resolveText.trim()) return;
    setResolving(true);
    try {
      const res = await fetch(`/api/proxy/feedback/${resolveTarget.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution: resolveText.trim() }),
      });
      if (!res.ok) throw new Error('Gagal menyimpan');

      // Update local data
      setData((prev) =>
        prev.map((item) =>
          item.id === resolveTarget.id
            ? { ...item, feedbackResolved: true, feedbackResolution: resolveText.trim(), feedbackResolvedAt: new Date().toISOString() }
            : item
        )
      );
      setResolveTarget(null);
      setResolveText('');
      toast.success('Tanggapan berhasil disimpan');
    } catch (err) {
      toast.error('Gagal menyimpan solusi. Coba lagi.');
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <PageHeader
            title="Semua Feedback"
            description="Kelola dan tanggapi semua feedback dari penerima manfaat."
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageSquare size={16} />
          <span className="font-semibold">{activeTab === 'siswa' ? total : observasi.length}</span>{' '}
          {activeTab === 'siswa' ? 'feedback' : 'observasi'}
        </div>
      </div>

      {/* Tab switcher: Siswa vs Guru */}
      <div className="flex gap-1 p-1 bg-muted/40 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('siswa')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'siswa' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageSquare size={15} /> Feedback Siswa
        </button>
        <button
          onClick={() => setActiveTab('guru')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'guru' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <GraduationCap size={15} /> Observasi Guru
        </button>
      </div>

      {activeTab === 'siswa' ? (
      <>
      {/* Filters Card */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="pt-6 space-y-3">
          {/* Search Row */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Cari nama siswa atau isi feedback..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Date Range */}
            <div className="col-span-2 flex items-center gap-2">
              <Calendar size={16} className="text-muted-foreground shrink-0" />
              <input
                type="date"
                value={tanggalAwal}
                onChange={(e) => setTanggalAwal(e.target.value)}
                className="h-9 flex-1 min-w-0 bg-white border border-input rounded-md px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary transition-all"
              />
              <span className="text-muted-foreground shrink-0">—</span>
              <input
                type="date"
                value={tanggalAkhir}
                onChange={(e) => setTanggalAkhir(e.target.value)}
                className="h-9 flex-1 min-w-0 bg-white border border-input rounded-md px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary transition-all"
              />
            </div>

            {/* Sentimen Filter */}
            <Select
              value={sentimen}
              onChange={(e) => setSentimen(e.target.value)}
              className="bg-white"
              options={[
                { label: 'Semua Label', value: '' },
                { label: '🟢 Positif', value: 'POSITIF' },
                { label: '⚪ Netral', value: 'NETRAL' },
                { label: '🔴 Negatif', value: 'NEGATIF' },
              ]}
            />

            {/* Sekolah Filter */}
            {sekolahList.length > 0 && (
              <Select
                value={sekolahId}
                onChange={(e) => setSekolahId(e.target.value)}
                className="bg-white"
                options={[{ label: 'Semua Sekolah', value: '' }, ...sekolahList.map((s) => ({ label: s.nama, value: s.id }))]}
              />
            )}

            {/* Status Filter */}
            <Select
              value={resolvedFilter}
              onChange={(e) => setResolvedFilter(e.target.value)}
              className="bg-white"
              options={[
                { label: 'Semua Status', value: '' },
                { label: 'Belum Ditanggapi', value: 'false' },
                { label: 'Sudah Ditanggapi', value: 'true' },
              ]}
            />

            {/* Kategori Filter */}
            <Select
              value={kategoriFilter}
              onChange={(e) => setKategoriFilter(e.target.value)}
              className="bg-white"
              options={[
                { label: 'Semua Kategori', value: '' },
                { label: '🍽️ Rasa', value: 'RASA' },
                { label: '📦 Porsi', value: 'PORSI' },
                { label: '⚡ Kualitas', value: 'KUALITAS' },
                { label: '🧹 Kebersihan', value: 'KEBERSIHAN' },
                { label: '🚚 Distribusi', value: 'DISTRIBUSI' },
                { label: '📌 Lainnya', value: 'LAINNYA' },
              ]}
            />
          </div>

          {hasFilters && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9 text-xs gap-1.5 text-muted-foreground hover:text-foreground">
                <RefreshCw size={12} /> Reset
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-48 gap-3">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-sm text-muted-foreground animate-pulse">Memuat feedback...</p>
        </div>
      ) : data.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <div className="p-4 rounded-full bg-muted/50 mb-3">
              <MessageSquare size={28} className="opacity-30" />
            </div>
            <p className="text-sm font-medium">Tidak ada feedback ditemukan</p>
            {hasFilters && (
              <p className="text-xs mt-1">Coba ubah filter pencarian Anda.</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.map((item, idx) => (
            <Card
              key={item.id}
              className={`border-border/50 shadow-sm hover:shadow-md transition-all overflow-hidden group ${
                item.feedbackResolved ? 'bg-green-50/30' : ''
              }`}
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              {/* Left accent bar */}
              <div className="flex">
                <div className={`w-1.5 shrink-0 ${
                  item.sentimen === 'POSITIF' ? 'bg-green-400' :
                  item.sentimen === 'NEGATIF' ? 'bg-red-400' :
                  item.sentimen === 'NETRAL' ? 'bg-gray-300' :
                  'bg-muted/60'
                }`} />

                <CardContent className="pt-6 flex-1 space-y-4">
                  {/* Top Row: Feedback text + badges */}
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-relaxed">
                        &ldquo;{item.feedback}&rdquo;
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <SentimentBadge sentimen={item.sentimen} skor={item.sentimenSkor} size="md" />
                        {item.kategori && item.kategori.length > 0 && item.kategori.map((kat) => (
                          <span
                            key={kat}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200/60"
                          >
                            <Tag size={8} />
                            {kat}
                          </span>
                        ))}
                        {item.feedbackResolved && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                            <CheckCircle2 size={10} />
                            Ditanggapi
                          </div>
                        )}
                        {item.ratingKeseluruhan && (
                          <span className="text-[10px] text-muted-foreground">
                            Rating: {item.ratingKeseluruhan}/5 ⭐
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Solve Button */}
                    {!item.feedbackResolved && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 h-8 px-3 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary hover:text-white transition-all"
                        onClick={() => { setResolveTarget(item); setResolveText(''); }}
                      >
                        <CheckCircle2 size={12} />
                        Tanggapi
                      </Button>
                    )}
                  </div>

                  {/* Resolution Display */}
                  {item.feedbackResolved && item.feedbackResolution && (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-3 space-y-1">
                      <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 size={10} />
                        Tanggapan Tim Dapur
                      </p>
                      <p className="text-xs text-green-800 leading-relaxed">{item.feedbackResolution}</p>
                      {item.feedbackResolvedAt && (
                        <p className="text-[9px] text-green-500">
                          {new Date(item.feedbackResolvedAt).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                          {item.feedbackResolvedBy && ` · oleh ${item.feedbackResolvedBy.name}`}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Bottom: Metadata */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {item.penerimaManfaat.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-foreground">{item.penerimaManfaat.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {item.distribusi?.sekolah?.nama || '-'}
                          {item.distribusi?.menu && <> · {item.distribusi.menu.nama}</>}
                        </p>
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                      {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center px-6 py-4 mt-4 gap-1 bg-white rounded-xl border border-border/50 shadow-sm">
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
      </>
      ) : (
      <>
        {/* === Observasi Guru === */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6 flex flex-wrap gap-4 items-end">
            {sekolahList.length > 0 && (
              <div className="flex items-center gap-2">
                <School size={14} className="text-muted-foreground shrink-0" />
                <Select
                  value={obsSekolahId}
                  onChange={(e) => setObsSekolahId(e.target.value)}
                  className="bg-white"
                  wrapperClassName="min-w-[180px]"
                  options={[{ label: 'Semua Sekolah', value: '' }, ...sekolahList.map((s) => ({ label: s.nama, value: s.id }))]}
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-muted-foreground shrink-0" />
              <input
                type="date"
                value={obsTanggal}
                onChange={(e) => setObsTanggal(e.target.value)}
                className="text-xs bg-white border border-border/60 rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
            </div>
            {(obsSekolahId || obsTanggal) && (
              <Button variant="ghost" size="sm" onClick={() => { setObsSekolahId(''); setObsTanggal(''); }} className="h-9 text-xs gap-1.5 text-muted-foreground hover:text-foreground">
                <RefreshCw size={12} /> Reset
              </Button>
            )}
          </CardContent>
        </Card>

        {obsLoading ? (
          <div className="flex flex-col justify-center items-center h-48 gap-3">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-sm text-muted-foreground animate-pulse">Memuat observasi...</p>
          </div>
        ) : observasi.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <div className="p-4 rounded-full bg-muted/50 mb-3">
                <GraduationCap size={28} className="opacity-30" />
              </div>
              <p className="text-sm font-medium">Belum ada observasi guru</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {observasi.map((item: any, idx: number) => (
              <Card key={item.id} className="border-border/50 shadow-sm overflow-hidden" style={{ animationDelay: `${idx * 40}ms` }}>
                <div className="flex">
                  <div className="w-1.5 shrink-0 bg-blue-400" />
                  <CardContent className="pt-6 flex-1 space-y-3">
                    <p className="text-sm text-foreground leading-relaxed italic">&ldquo;{item.isi}&rdquo;</p>
                    {item.kategori && item.kategori.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.kategori.map((kat: string) => (
                          <span key={kat} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200/60">
                            <Tag size={8} /> {kat}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <User size={12} />
                        </div>
                        <div>
                          <p className="text-[11px] font-medium text-foreground">{item.guru?.name || 'Guru'}</p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {item.sekolah?.nama || '-'}
                            {item.distribusi?.menu && (<><span>·</span><UtensilsCrossed size={9} /> {item.distribusi.menu.nama}</>)}
                          </p>
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                        {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </>
      )}

      {/* Resolve Modal */}
      {resolveTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setResolveTarget(null)}
        >
          <div
            className="bg-card rounded-2xl shadow-2xl w-full max-w-lg border border-border/50 animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <MessageSquare size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Tanggapi Feedback</h3>
                  <p className="text-[11px] text-muted-foreground">{resolveTarget.penerimaManfaat.name}</p>
                </div>
              </div>
              <button
                onClick={() => setResolveTarget(null)}
                className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Original feedback */}
              <div className="bg-muted/30 border border-border/40 rounded-xl p-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Feedback Asli</p>
                <p className="text-sm italic text-foreground leading-relaxed">&ldquo;{resolveTarget.feedback}&rdquo;</p>
                <div className="mt-2">
                  <SentimentBadge sentimen={resolveTarget.sentimen} skor={resolveTarget.sentimenSkor} size="md" />
                </div>
              </div>

              {/* Resolution input */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Solusi / Tindakan yang Diambil
                </label>
                <textarea
                  value={resolveText}
                  onChange={(e) => setResolveText(e.target.value)}
                  placeholder="Jelaskan tindakan yang sudah atau akan diambil untuk menanggapi feedback ini..."
                  rows={4}
                  className="w-full rounded-xl border border-border/60 bg-white text-sm p-3 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none placeholder:text-muted-foreground/50"
                  autoFocus
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 p-5 border-t border-border/40 bg-muted/10">
              <Button variant="ghost" size="sm" onClick={() => setResolveTarget(null)} className="h-9 px-4">
                Batal
              </Button>
              <Button
                size="sm"
                onClick={handleResolve}
                disabled={!resolveText.trim() || resolving}
                className="h-9 px-5 gap-2"
              >
                {resolving ? (
                  <><Loader2 size={14} className="animate-spin" /> Menyimpan...</>
                ) : (
                  <><CheckCircle2 size={14} /> Tandai Selesai</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
