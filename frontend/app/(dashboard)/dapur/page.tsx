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

function StarRating({ value, max = 5 }: { value: number | null; max?: number }) {
  if (value === null) return <span className="text-muted-foreground text-sm">—</span>;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} size={14} className={i < Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-muted/50'} />
      ))}
      <span className="text-sm font-semibold ml-1">{value.toFixed(1)}</span>
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Dashboard Tim Dapur"
        description="Pantau kinerja distribusi dan evaluasi makanan dari dapur Anda."
      />

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Dari Tanggal</label>
              <input
                type="date"
                value={tanggalAwal}
                onChange={(e) => setTanggalAwal(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Sampai Tanggal</label>
              <input
                type="date"
                value={tanggalAkhir}
                onChange={(e) => setTanggalAkhir(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <Button onClick={fetchStats} className="flex items-center gap-2 h-10">
              <RefreshCw size={14} />
              Terapkan Filter
            </Button>
            <Button variant="outline" onClick={() => { setTanggalAwal(''); setTanggalAkhir(''); }} className="h-10">
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : error ? (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : stats ? (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-l-4 border-l-blue-400">
              <CardContent className="p-5 flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-50">
                  <Truck size={22} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Distribusi</p>
                  <p className="text-3xl font-bold">{stats.totalDistribusi}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-5 flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Star size={22} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Rata Evaluasi Masuk</p>
                  <p className="text-3xl font-bold">{stats.totalEvaluasi}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Rata-rata Rating Makanan</p>
                <StarRating value={stats.rataRatingKeseluruhan} />
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">dari {stats.totalEvaluasi} evaluasi</p>
              </div>
            </CardContent>
          </Card>

          {/* Status Distribusi */}
          {Object.keys(stats.distribusiPerStatus).length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  Distribusi per Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.distribusiPerStatus).map(([status, count]) => {
                    const cfg = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
                    return (
                      <div key={status} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${cfg.color}`}>
                        <span>{cfg.label}</span>
                        <span className="font-bold">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Komponen Sering Tidak Habis */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingDown size={16} className="text-destructive" />
                  Komponen Rata Keterhabisan Terendah
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.komponenSeringTidakHabis.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Belum ada data penilaian komponen.</p>
                ) : (
                  stats.komponenSeringTidakHabis.map((k, i) => (
                    <div key={k.komponenId} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground w-5 text-center">{i + 1}</span>
                        <span className="text-sm font-medium">{k.nama}</span>
                      </div>
                      <StarRating value={k.rataKeterhabisan} />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Feedback Terbaru */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare size={16} className="text-primary" />
                  Feedback Terbaru
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.feedbackTerbaru.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Belum ada feedback masuk.</p>
                ) : (
                  stats.feedbackTerbaru.map((f) => (
                    <div key={f.id} className="p-3 rounded-lg bg-muted/40 border border-border/50">
                      <p className="text-sm italic text-foreground">"{f.feedback}"</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">{f.penerimaManfaat} · {f.sekolah}</p>
                        <p className="text-xs text-muted-foreground">
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

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <a href="/dapur/menu">
          <Button variant="outline" className="w-full h-11 justify-start gap-2 text-sm">
            <span>📋</span> Kelola Menu
          </Button>
        </a>
        <a href="/dapur/distribusi">
          <Button variant="outline" className="w-full h-11 justify-start gap-2 text-sm">
            <span>🚚</span> Distribusi
          </Button>
        </a>
        <a href="/dapur/jadwal">
          <Button variant="outline" className="w-full h-11 justify-start gap-2 text-sm">
            <span>📅</span> Jadwal Menu
          </Button>
        </a>
        <a href="/laporan">
          <Button variant="outline" className="w-full h-11 justify-start gap-2 text-sm">
            <span>📊</span> Unduh Laporan
          </Button>
        </a>
      </div>
    </div>
  );
}
