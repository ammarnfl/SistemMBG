'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Loader2, Truck, Star, TrendingDown, MessageSquare, Calendar, RefreshCw } from 'lucide-react';

interface DapurStats {
  totalDistribusi: number;
  totalEvaluasi: number;
  rataRatingKeseluruhan: number | null;
  distribusiPerStatus: Record<string, number>;
  komponenSeringTidakHabis: { komponenId: string; nama: string; rataKeterhabisan: number | null }[];
  feedbackTerbaru: { id: string; feedback: string; penerimaManfaat: string; sekolah: string; tanggal: string }[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  DIKIRIM: { label: 'Dikirim', color: 'bg-blue-100 text-blue-700' },
  DITERIMA: { label: 'Diterima', color: 'bg-cyan-100 text-cyan-700' },
  BERMASALAH: { label: 'Bermasalah', color: 'bg-red-100 text-red-700' },
  SELESAI: { label: 'Selesai', color: 'bg-green-100 text-green-700' },
};

function StarRating({ value, max = 5, size = 14 }: { value: number | null; max?: number; size?: number }) {
  if (value === null) return <span className="text-muted-foreground text-sm">—</span>;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} size={size} className={i < Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-muted/20'} />
      ))}
    </div>
  );
}

export default function DapurDashboard() {
  const [stats, setStats] = useState<DapurStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tanggalAwal, setTanggalAwal] = useState('');
  const [tanggalAkhir, setTanggalAkhir] = useState('');

  const fetchStats = () => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (tanggalAwal) params.set('tanggalAwal', tanggalAwal);
    if (tanggalAkhir) params.set('tanggalAkhir', tanggalAkhir);
    const qs = params.toString() ? `?${params.toString()}` : '';
    fetch(`/api/proxy/dashboard/dapur${qs}`)
      .then((r) => r.ok ? r.json() : Promise.reject('Gagal memuat data'))
      .then((json) => setStats(json?.data ?? json))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStats(); }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Dashboard Tim Dapur"
          description="Pantau kinerja distribusi dan evaluasi makanan dari dapur Anda."
        />
        
        {/* Filter - Compact version */}
        <div className="flex items-center gap-2 bg-muted/40 p-2 rounded-xl border border-border/50">
          <div className="flex items-center gap-2 px-2">
            <Calendar size={16} className="text-muted-foreground" />
            <input
              type="date"
              value={tanggalAwal}
              onChange={(e) => setTanggalAwal(e.target.value)}
              className="bg-transparent border-none text-xs focus:ring-0 w-28"
            />
            <span className="text-muted-foreground">—</span>
            <input
              type="date"
              value={tanggalAkhir}
              onChange={(e) => setTanggalAkhir(e.target.value)}
              className="bg-transparent border-none text-xs focus:ring-0 w-28"
            />
          </div>
          <Button onClick={fetchStats} size="sm" className="h-8 px-3 text-xs gap-1.5 rounded-lg">
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Update
          </Button>
          {(tanggalAwal || tanggalAkhir) && (
            <Button variant="ghost" size="sm" onClick={() => { setTanggalAwal(''); setTanggalAkhir(''); }} className="h-8 w-8 p-0 rounded-lg">
              ×
            </Button>
          )}
        </div>
      </div>

      {/* Quick Links - More visual cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Akses Cepat</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/dapur/menu" className="group">
            <div className="bg-card border border-border/60 p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/40 hover:-translate-y-1 transition-all text-center">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📋</span>
              </div>
              <p className="text-xs font-bold text-foreground">Kelola Menu</p>
            </div>
          </a>
          <a href="/dapur/distribusi" className="group">
            <div className="bg-card border border-border/60 p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/40 hover:-translate-y-1 transition-all text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🚚</span>
              </div>
              <p className="text-xs font-bold text-foreground">Distribusi</p>
            </div>
          </a>
          <a href="/dapur/jadwal" className="group">
            <div className="bg-card border border-border/60 p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/40 hover:-translate-y-1 transition-all text-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📅</span>
              </div>
              <p className="text-xs font-bold text-foreground">Jadwal Menu</p>
            </div>
          </a>
          <a href="/laporan" className="group">
            <div className="bg-card border border-border/60 p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/40 hover:-translate-y-1 transition-all text-center">
              <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-xs font-bold text-foreground">Unduh Laporan</p>
            </div>
          </a>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-sm text-muted-foreground animate-pulse">Menyiapkan data dashboard...</p>
        </div>
      ) : error ? (
        <Card className="border-destructive/30 bg-destructive/5 overflow-hidden">
          <div className="h-1 bg-destructive/50 w-full" />
          <CardContent className="p-6 text-center">
            <p className="text-sm text-destructive font-medium">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchStats} className="mt-4">Coba Lagi</Button>
          </CardContent>
        </Card>
      ) : stats ? (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="relative overflow-hidden border-none shadow-sm hover:shadow-md transition-all group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 group-hover:w-2 transition-all" />
              <div className="p-6 flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-blue-50 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Truck size={28} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Total Distribusi</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-extrabold text-foreground">{stats.totalDistribusi}</p>
                    <span className="text-xs text-muted-foreground font-medium italic">Selesai</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="relative overflow-hidden border-none shadow-sm hover:shadow-md transition-all group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 group-hover:w-2 transition-all" />
              <div className="p-6 flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Star size={28} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Evaluasi Masuk</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-extrabold text-foreground">{stats.totalEvaluasi}</p>
                    <span className="text-xs text-muted-foreground font-medium italic">Review</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="relative overflow-hidden border-none shadow-sm bg-gradient-to-br from-amber-500/5 to-transparent">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400" />
              <div className="p-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Rating Rata-rata</p>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-extrabold text-foreground">
                        {stats.rataRatingKeseluruhan?.toFixed(1) || '0.0'}
                      </span>
                      <div className="h-8 w-px bg-border" />
                      <StarRating value={stats.rataRatingKeseluruhan} size={20} />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium">Skala 1.0 - 5.0 bintang</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Status Distribusi */}
          {Object.keys(stats.distribusiPerStatus).length > 0 && (
            <Card className="border-border/40 shadow-sm bg-muted/20">
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mr-2">
                    <Calendar size={16} />
                    <span>Status Hari Ini:</span>
                  </div>
                  {Object.entries(stats.distribusiPerStatus).map(([status, count]) => {
                    const cfg = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
                    return (
                      <div key={status} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold ${cfg.color} border border-black/5 shadow-sm`}>
                        <span>{cfg.label}</span>
                        <div className="w-px h-3 bg-current opacity-20" />
                        <span>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Komponen Sering Tidak Habis */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3 border-b border-border/40 mb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-red-50">
                    <TrendingDown size={18} className="text-red-500" />
                  </div>
                  Komponen Paling Disukai
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {stats.komponenSeringTidakHabis.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <div className="p-3 rounded-full bg-muted/50 mb-3">
                      <MessageSquare size={24} className="opacity-20" />
                    </div>
                    <p className="text-sm">Belum ada data penilaian.</p>
                  </div>
                ) : (
                  stats.komponenSeringTidakHabis.map((k, i) => (
                    <div key={k.komponenId} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'}`}>
                          {i + 1}
                        </div>
                        <span className="text-sm font-semibold text-foreground group-hover:translate-x-1 transition-transform">{k.nama}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StarRating value={k.rataKeterhabisan} size={12} />
                        <span className="text-xs font-bold text-muted-foreground w-6 text-right">{k.rataKeterhabisan?.toFixed(1)}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Feedback Terbaru */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3 border-b border-border/40 mb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-50">
                    <MessageSquare size={18} className="text-blue-500" />
                  </div>
                  Feedback Terbaru
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                {stats.feedbackTerbaru.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <div className="p-3 rounded-full bg-muted/50 mb-3">
                      <MessageSquare size={24} className="opacity-20" />
                    </div>
                    <p className="text-sm">Belum ada feedback masuk.</p>
                  </div>
                ) : (
                  stats.feedbackTerbaru.map((f) => (
                    <div key={f.id} className="p-4 rounded-2xl bg-muted/30 border border-border/40 hover:border-primary/30 transition-colors relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                        <MessageSquare size={40} />
                      </div>
                      <p className="text-sm italic text-foreground leading-relaxed">"{f.feedback}"</p>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                            {f.penerimaManfaat.charAt(0)}
                          </div>
                          <p className="text-[11px] font-medium text-muted-foreground">{f.penerimaManfaat} · <span className="text-foreground/70">{f.sekolah}</span></p>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                          {new Date(f.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
