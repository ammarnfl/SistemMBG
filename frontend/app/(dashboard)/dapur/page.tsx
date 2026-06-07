'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { StatCard } from '../../../components/ui/StatCard';
import { SentimentBadge, SENTIMEN_CONFIG } from '../../../components/ui/SentimentBadge';
import { Loader2, Truck, Star, TrendingDown, MessageSquare, Calendar, RefreshCw, ChevronRight, AlertTriangle, CheckCircle2, Send, FileText, ArrowRight, BookOpen, CalendarDays, ClipboardList, Tag } from 'lucide-react';

interface DapurStats {
  totalDistribusi: number;
  totalEvaluasi: number;
  rataRatingKeseluruhan: number | null;
  distribusiPerStatus: Record<string, number>;
  statusHariIni?: Record<string, number>;
  distribusiHariIniDetail?: { id: string; status: string; jumlahPorsi: number; sekolah: string; menu: string }[];
  komponenSeringTidakHabis: { komponenId: string; nama: string; rataKeterhabisan: number | null }[];
  sentimenDistribusi: { POSITIF: number; NETRAL: number; NEGATIF: number };
  kategoriKeluhan?: { kategori: string; jumlah: number }[];
  feedbackTerbaru: {
    id: string; feedback: string; penerimaManfaat: string; sekolah: string;
    tanggal: string; sentimen: 'POSITIF' | 'NETRAL' | 'NEGATIF' | null; sentimenSkor: number | null;
  }[];
}

// SentimentBadge & SENTIMEN_CONFIG dipindah ke components/ui/SentimentBadge

const STATUS_ICON: Record<string, { icon: React.ReactNode; bg: string; text: string }> = {
  DRAFT: { icon: <FileText size={16} />, bg: 'bg-gray-100', text: 'text-gray-600' },
  DIKIRIM: { icon: <Send size={16} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  DITERIMA: { icon: <CheckCircle2 size={16} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  BERMASALAH: { icon: <AlertTriangle size={16} />, bg: 'bg-red-100', text: 'text-red-600' },
  SELESAI: { icon: <CheckCircle2 size={16} />, bg: 'bg-green-100', text: 'text-green-600' },
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Draft', DIKIRIM: 'Dikirim', DITERIMA: 'Diterima', BERMASALAH: 'Bermasalah', SELESAI: 'Selesai',
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

/** Get Monday of the current week in YYYY-MM-DD */
function getMonday(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Sun,1=Mon...
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  return monday.toISOString().slice(0, 10);
}
function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function DapurDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DapurStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tanggalAwal, setTanggalAwal] = useState(getMonday());
  const [tanggalAkhir, setTanggalAkhir] = useState(getToday());

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

  const totalHariIni = stats?.statusHariIni ? Object.values(stats.statusHariIni).reduce((a, b) => a + b, 0) : 0;
  const totalSentimen = stats?.sentimenDistribusi ? Object.values(stats.sentimenDistribusi).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Dashboard Tim Dapur"
          description="Pantau kinerja distribusi dan evaluasi makanan dari dapur Anda."
        />
        <div className="flex w-full md:w-auto items-center gap-2 bg-muted/40 p-2 rounded-xl border border-border/50">
          <Calendar size={16} className="text-muted-foreground shrink-0 ml-1" />
          <input type="date" value={tanggalAwal} onChange={(e) => setTanggalAwal(e.target.value)} className="bg-transparent border-none text-xs focus:ring-0 flex-1 min-w-0 md:flex-none md:w-28" />
          <span className="text-muted-foreground shrink-0">—</span>
          <input type="date" value={tanggalAkhir} onChange={(e) => setTanggalAkhir(e.target.value)} className="bg-transparent border-none text-xs focus:ring-0 flex-1 min-w-0 md:flex-none md:w-28" />
          <Button onClick={fetchStats} size="sm" className="h-8 px-3 text-xs gap-1.5 rounded-lg shrink-0">
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> <span className="hidden sm:inline">Update</span>
          </Button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Akses Cepat</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: '/dapur/menu', icon: BookOpen, label: 'Kelola Menu', tint: 'bg-primary/10 text-primary' },
            { href: '/dapur/distribusi', icon: Truck, label: 'Distribusi', tint: 'bg-blue-50 text-blue-600' },
            { href: '/dapur/jadwal', icon: CalendarDays, label: 'Jadwal Menu', tint: 'bg-emerald-50 text-emerald-600' },
            { href: '/laporan', icon: ClipboardList, label: 'Unduh Laporan', tint: 'bg-rose-50 text-rose-600' },
          ].map((link) => {
            const Icon = link.icon;
            return (
              <a key={link.href} href={link.href} className="group">
                <div className="bg-card border border-border/60 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-primary/40 hover:-translate-y-1 transition-all text-center">
                  <div className={`w-12 h-12 ${link.tint} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon size={22} />
                  </div>
                  <p className="text-xs font-bold text-foreground">{link.label}</p>
                </div>
              </a>
            );
          })}
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
            <StatCard icon={Truck} label="Total Distribusi" value={stats.totalDistribusi} accentClass="border-l-blue-500" note="Minggu ini" />
            <StatCard icon={MessageSquare} label="Evaluasi Masuk" value={stats.totalEvaluasi} accentClass="border-l-emerald-500" note="Review" />
            <StatCard
              icon={Star}
              label="Rating Rata-rata"
              value={stats.rataRatingKeseluruhan?.toFixed(1) || '0.0'}
              accentClass="border-l-amber-400"
              extra={<StarRating value={stats.rataRatingKeseluruhan} size={16} />}
            />
          </div>

          {/* Status Hari Ini & Sentimen Feedback — Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Hari Ini */}
            <Card className="border-border/60 shadow-sm overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/40 bg-gradient-to-r from-blue-50/50 to-transparent">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-100"><Truck size={18} className="text-blue-600" /></div>
                    Status Hari Ini
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => router.push('/dapur/distribusi')} className="text-xs gap-1 text-primary hover:text-primary/80 hover:bg-primary/5">
                    Distribusi <ArrowRight size={14} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                {totalHariIni === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <div className="p-3 rounded-full bg-muted/50 mb-3"><Truck size={24} className="opacity-20" /></div>
                    <p className="text-sm font-medium">Belum ada distribusi hari ini</p>
                    <Button size="sm" variant="outline" className="mt-3 text-xs" onClick={() => router.push('/dapur/distribusi')}>Buat Distribusi Baru</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Status summary badges */}
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(stats.statusHariIni || {}).map(([status, count]) => {
                        const cfg = STATUS_ICON[status] || { icon: <FileText size={16} />, bg: 'bg-gray-100', text: 'text-gray-600' };
                        return (
                          <div key={status} className={`flex items-center gap-2 px-3.5 py-2 rounded-xl ${cfg.bg} ${cfg.text} border border-black/5 shadow-sm`}>
                            {cfg.icon}
                            <span className="text-xs font-bold">{STATUS_LABEL[status] || status}</span>
                            <div className="w-px h-4 bg-current opacity-20" />
                            <span className="text-sm font-extrabold">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                    {/* Detail list */}
                    {stats.distribusiHariIniDetail && stats.distribusiHariIniDetail.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-border/40">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Detail Pengiriman</p>
                        {stats.distribusiHariIniDetail.slice(0, 4).map((d) => {
                          const cfg = STATUS_ICON[d.status] || { bg: 'bg-gray-100', text: 'text-gray-600', icon: null };
                          return (
                            <div key={d.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-7 h-7 rounded-lg ${cfg.bg} ${cfg.text} flex items-center justify-center shrink-0`}>{cfg.icon}</div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-foreground truncate">{d.sekolah}</p>
                                  <p className="text-[10px] text-muted-foreground truncate">{d.menu} · {d.jumlahPorsi} porsi</p>
                                </div>
                              </div>
                              <Badge className={`text-[10px] px-2 py-0.5 font-semibold border-0 shrink-0 ${cfg.bg} ${cfg.text}`}>{STATUS_LABEL[d.status]}</Badge>
                            </div>
                          );
                        })}
                        {stats.distribusiHariIniDetail.length > 4 && (
                          <p className="text-[10px] text-center text-muted-foreground">+{stats.distribusiHariIniDetail.length - 4} lainnya</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sentimen Feedback */}
            <Card className="border-border/60 shadow-sm overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/40 bg-gradient-to-r from-purple-50/50 to-transparent">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-100"><MessageSquare size={18} className="text-purple-600" /></div>
                    Sentimen Feedback
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => router.push('/dapur/feedback')} className="text-xs gap-1 text-primary hover:text-primary/80 hover:bg-primary/5">
                    Feedback <ArrowRight size={14} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                {totalSentimen === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <div className="p-3 rounded-full bg-muted/50 mb-3"><MessageSquare size={24} className="opacity-20" /></div>
                    <p className="text-sm font-medium">Belum ada feedback minggu ini</p>
                    <p className="text-[10px] mt-1">Feedback akan muncul setelah siswa mengisi evaluasi</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Visual progress bars */}
                    <div className="space-y-3">
                      {(['POSITIF', 'NETRAL', 'NEGATIF'] as const).map((key) => {
                        const cfg = SENTIMEN_CONFIG[key];
                        const count = stats.sentimenDistribusi[key] || 0;
                        const pct = totalSentimen > 0 ? (count / totalSentimen) * 100 : 0;
                        return (
                          <div key={key} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                                <span className="text-xs font-bold text-foreground">{cfg.label}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-extrabold text-foreground">{count}</span>
                                <span className="text-[10px] text-muted-foreground font-medium w-10 text-right">({Math.round(pct)}%)</span>
                              </div>
                            </div>
                            <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
                              <div className={`h-full ${cfg.dot} rounded-full transition-all duration-700 ease-out`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                      <p className="text-[11px] text-muted-foreground"><span className="font-bold text-foreground">{totalSentimen}</span> feedback dianalisis minggu ini</p>
                      <Button variant="outline" size="sm" onClick={() => router.push('/dapur/feedback')} className="text-[10px] h-7 gap-1 rounded-lg">
                        Lihat Semua <ChevronRight size={12} />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Kategori Keluhan Utama */}
          {stats.kategoriKeluhan && stats.kategoriKeluhan.length > 0 && (
            <Card className="border-border/60 shadow-sm overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/40 bg-gradient-to-r from-orange-50/50 to-transparent">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-orange-100"><Tag size={18} className="text-orange-600" /></div>
                    Kategori Keluhan Utama
                  </CardTitle>
                  <span className="text-[10px] text-muted-foreground font-medium">Berdasarkan feedback negatif</span>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-3">
                  {stats.kategoriKeluhan.map((item, i) => {
                    const totalKeluhan = stats.kategoriKeluhan!.reduce((a, b) => a + b.jumlah, 0);
                    const pct = totalKeluhan > 0 ? (item.jumlah / totalKeluhan) * 100 : 0;
                    const colors = [
                      'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 'bg-lime-500', 'bg-gray-400',
                    ];
                    const barColor = colors[i] || colors[colors.length - 1];
                    return (
                      <div key={item.kategori} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${barColor}`} />
                            <span className="text-xs font-bold text-foreground">{item.kategori}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-foreground">{item.jumlah}</span>
                            <span className="text-[10px] text-muted-foreground font-medium w-10 text-right">({Math.round(pct)}%)</span>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
                          <div className={`h-full ${barColor} rounded-full transition-all duration-700 ease-out`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-3 mt-3 border-t border-border/40">
                  <p className="text-[11px] text-muted-foreground">
                    <span className="font-bold text-foreground">{stats.kategoriKeluhan.reduce((a, b) => a + b.jumlah, 0)}</span> keluhan dikategorisasi dari feedback negatif
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bottom: Komponen + Feedback Terbaru */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3 border-b border-border/40 mb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-red-50"><TrendingDown size={18} className="text-red-500" /></div>
                  Komponen Perlu Perhatian
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {stats.komponenSeringTidakHabis.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <div className="p-3 rounded-full bg-muted/50 mb-3"><MessageSquare size={24} className="opacity-20" /></div>
                    <p className="text-sm">Belum ada data penilaian.</p>
                  </div>
                ) : (
                  stats.komponenSeringTidakHabis.map((k, i) => (
                    <div key={k.komponenId} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'}`}>{i + 1}</div>
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

            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3 border-b border-border/40 mb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-50"><MessageSquare size={18} className="text-blue-500" /></div>
                    Feedback Terbaru
                  </CardTitle>
                  <a href="/dapur/feedback" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all group">
                    Lihat Semua <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                {stats.feedbackTerbaru.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <div className="p-3 rounded-full bg-muted/50 mb-3"><MessageSquare size={24} className="opacity-20" /></div>
                    <p className="text-sm">Belum ada feedback masuk.</p>
                  </div>
                ) : (
                  stats.feedbackTerbaru.map((f) => (
                    <div key={f.id} className="p-4 rounded-2xl bg-muted/30 border border-border/40 hover:border-primary/30 transition-colors relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity"><MessageSquare size={40} /></div>
                      <p className="text-sm italic text-foreground leading-relaxed">"{f.feedback}"</p>
                      <div className="mt-2"><SentimentBadge sentimen={f.sentimen} skor={f.sentimenSkor} /></div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{f.penerimaManfaat.charAt(0)}</div>
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
