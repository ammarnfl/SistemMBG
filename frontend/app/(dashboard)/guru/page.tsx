'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Loader2, School, Users, CheckCircle2, Clock, Truck, ChevronRight, UtensilsCrossed, Flame, Beef, Droplets, Wheat, Leaf, MessageSquare, ClipboardCheck, XCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface MenuKomponen {
  id: string;
  nama: string;
  deskripsi: string | null;
}

interface MenuDetail {
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

interface GuruStats {
  sekolah: { id: string; nama: string } | null;
  distribusiHariIni: {
    id: string;
    status: string;
    jumlahPorsi: number;
    tanggal: string;
    menu: MenuDetail | null;
  } | null;
  totalPM: number;
  sudahIsi: number;
  belumIsi: number;
  feedbackTerbaru: {
    id: string;
    feedback: string;
    penerimaManfaat: string;
    sekolah: string;
    tanggal: string;
    sentimen: 'POSITIF' | 'NETRAL' | 'NEGATIF' | null;
    sentimenSkor: number | null;
  }[];
  presensiTerbaru: {
    id: string;
    name: string;
    kelas: string;
    statusKonsumsi: 'KONSUMSI' | 'TIDAK_KONSUMSI' | null;
    rating: number | null;
    sudahFeedback: boolean;
  }[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  DIKIRIM: { label: 'Dalam Perjalanan', color: 'bg-blue-100 text-blue-700' },
  DITERIMA: { label: 'Diterima', color: 'bg-cyan-100 text-cyan-700' },
  BERMASALAH: { label: 'Bermasalah', color: 'bg-red-100 text-red-700' },
  SELESAI: { label: 'Selesai', color: 'bg-green-100 text-green-700' },
};

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function NutritionPill({ icon, label, value, unit, color }: { icon: React.ReactNode; label: string; value: number | null; unit: string; color: string }) {
  if (value == null) return null;
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${color} text-xs font-medium`}>
      {icon}
      <span>{value}{unit}</span>
    </div>
  );
}

const SENTIMEN_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  POSITIF: { label: 'Positif', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  NETRAL: { label: 'Netral', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  NEGATIF: { label: 'Negatif', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

function SentimentBadge({ sentimen, skor }: { sentimen: string | null; skor: number | null }) {
  if (!sentimen || !(sentimen in SENTIMEN_CONFIG)) {
    return <span className="text-[10px] text-muted-foreground italic">Belum dianalisis</span>;
  }
  const cfg = SENTIMEN_CONFIG[sentimen];
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
      {skor !== null && <span className="opacity-60">({Math.round(skor * 100)}%)</span>}
    </div>
  );
}

export default function GuruDashboard() {
  const [stats, setStats] = useState<GuruStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFotoUrl, setSelectedFotoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/proxy/dashboard/guru')
      .then((r) => (r.ok ? r.json() : Promise.reject('Gagal memuat statistik')))
      .then((s) => setStats(s?.data ?? s))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary" size={36} /></div>;
  }

  const persen = stats && stats.totalPM > 0
    ? Math.round((stats.sudahIsi / stats.totalPM) * 100)
    : 0;

  const statusDistribusi = stats?.distribusiHariIni?.status
    ? STATUS_CONFIG[stats.distribusiHariIni.status]
    : null;

  const menu = stats?.distribusiHariIni?.menu;
  const fotoSrc = menu?.fotoUrl
    ? (menu.fotoUrl.startsWith('http') ? menu.fotoUrl : `${BACKEND_URL}${menu.fotoUrl}`)
    : null;

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Dashboard Guru"
        description={stats?.sekolah ? `${stats.sekolah.nama}` : 'Pantau distribusi dan pengisian evaluasi siswa hari ini.'}
      />

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {!stats?.sekolah && !loading && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-10 text-center text-muted-foreground">
            <School size={40} className="mb-3 opacity-40" />
            <p className="font-medium text-foreground">Belum dipetakan ke sekolah</p>
            <p className="text-sm mt-1">Minta Admin untuk menghubungkan akun Anda ke sekolah terlebih dahulu.</p>
          </CardContent>
        </Card>
      )}

      {stats?.sekolah && (
        <>
          {/* Distribusi hari ini — rich card */}
          <Card className={`border-l-4 overflow-hidden ${stats.distribusiHariIni ? 'border-l-primary' : 'border-l-muted'}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Truck size={16} className="text-primary" />
                  Distribusi Hari Ini
                </CardTitle>
                {statusDistribusi && (
                  <Badge className={`${statusDistribusi.color} border-0 shrink-0`}>{statusDistribusi.label}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {stats.distribusiHariIni ? (
                <div className="space-y-4">
                  {/* Menu header with foto */}
                  <div className="flex gap-4">
                    {fotoSrc ? (
                      <div 
                        className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-muted border shadow-sm cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                        onClick={() => setSelectedFotoUrl(fotoSrc)}
                      >
                        <Image src={fotoSrc} alt={menu?.nama || 'Foto menu'} width={80} height={80} className="w-full h-full object-cover" unoptimized />
                      </div>
                    ) : (
                      <div className="shrink-0 w-20 h-20 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border flex items-center justify-center">
                        <UtensilsCrossed size={28} className="text-primary/40" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-lg leading-tight">{menu?.nama || 'Menu tidak diset'}</p>
                      {menu?.deskripsi && (
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{menu.deskripsi}</p>
                      )}
                      <p className="text-sm text-primary font-medium mt-1">{stats.distribusiHariIni.jumlahPorsi} porsi makanan</p>
                    </div>
                  </div>

                  {/* Nutritional info pills */}
                  {menu && (menu.energiKkal || menu.proteinGram || menu.lemakGram || menu.karbohidratGram || menu.seratGram) && (
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">Nilai Gizi per Porsi</p>
                      <div className="flex flex-wrap gap-2">
                        <NutritionPill icon={<Flame size={12} />} label="Energi" value={menu.energiKkal} unit=" kkal" color="bg-orange-50 text-orange-700 border border-orange-100" />
                        <NutritionPill icon={<Beef size={12} />} label="Protein" value={menu.proteinGram} unit="g" color="bg-red-50 text-red-700 border border-red-100" />
                        <NutritionPill icon={<Droplets size={12} />} label="Lemak" value={menu.lemakGram} unit="g" color="bg-yellow-50 text-yellow-700 border border-yellow-100" />
                        <NutritionPill icon={<Wheat size={12} />} label="Karbo" value={menu.karbohidratGram} unit="g" color="bg-amber-50 text-amber-700 border border-amber-100" />
                        <NutritionPill icon={<Leaf size={12} />} label="Serat" value={menu.seratGram} unit="g" color="bg-green-50 text-green-700 border border-green-100" />
                      </div>
                    </div>
                  )}

                  {/* Komponen list */}
                  {menu && menu.komponen && menu.komponen.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">Komponen Menu</p>
                      <div className="grid grid-cols-2 gap-2">
                        {menu.komponen.map((k) => (
                          <div key={k.id} className="flex items-start gap-2 p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                            <span className="text-primary mt-0.5 shrink-0">•</span>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground leading-tight">{k.nama}</p>
                              {k.deskripsi && <p className="text-xs text-muted-foreground mt-0.5">{k.deskripsi}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link href={`/guru/distribusi/${stats.distribusiHariIni.id}`}>
                    <Button variant="outline" size="sm" className="gap-1 mt-1">
                      Lihat Detail Lengkap <ChevronRight size={14} />
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada distribusi hari ini untuk sekolah Anda.</p>
              )}
            </CardContent>
          </Card>

          {/* Pengisian evaluasi */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users size={16} className="text-primary" />
                Progres Pengisian Evaluasi Hari Ini
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Sudah mengisi</span>
                  <span className="text-sm font-bold">{stats.sudahIsi} / {stats.totalPM} ({persen}%)</span>
                </div>
                <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-700"
                    style={{ width: `${persen}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
                  <CheckCircle2 size={18} className="text-green-600" />
                  <div>
                    <p className="text-lg font-bold text-green-700">{stats.sudahIsi}</p>
                    <p className="text-xs text-green-600">Sudah Isi</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <Clock size={18} className="text-amber-600" />
                  <div>
                    <p className="text-lg font-bold text-amber-700">{stats.belumIsi}</p>
                    <p className="text-xs text-amber-600">Belum Isi</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monitoring & Feedback Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

            {/* Presensi Terbaru */}
            <Card className="border-border/60 shadow-sm h-full flex flex-col">
              <CardHeader className="pb-3 border-b border-border/40 mb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-green-50">
                      <ClipboardCheck size={18} className="text-green-600" />
                    </div>
                    Presensi Terbaru
                  </CardTitle>
                  <Link
                    href="/guru/presensi"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all group"
                  >
                    Detail
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                {!stats?.presensiTerbaru || stats.presensiTerbaru.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <div className="p-3 rounded-full bg-muted/50 mb-3">
                      <ClipboardCheck size={24} className="opacity-20" />
                    </div>
                    <p className="text-sm">Belum ada presensi terisi hari ini.</p>
                  </div>
                ) : (
                  stats.presensiTerbaru.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/40 hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                          {p.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground">{p.kelas}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {p.sudahFeedback && (
                          <MessageSquare size={13} className="text-blue-500" />
                        )}
                        {p.statusKonsumsi === 'KONSUMSI' ? (
                          <Badge className="text-[10px] border-0 bg-green-100 text-green-700 gap-1">
                            <CheckCircle2 size={11} /> Konsumsi
                          </Badge>
                        ) : (
                          <Badge className="text-[10px] border-0 bg-red-100 text-red-700 gap-1">
                            <XCircle size={11} /> Tidak
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Feedback Terbaru */}
            <Card className="border-border/60 shadow-sm h-full flex flex-col">
              <CardHeader className="pb-3 border-b border-border/40 mb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-50">
                      <MessageSquare size={18} className="text-blue-500" />
                    </div>
                    Feedback Terbaru
                  </CardTitle>
                  <Link
                    href="/guru/feedback"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all group"
                  >
                    Lihat Semua
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                {!stats?.feedbackTerbaru || stats.feedbackTerbaru.length === 0 ? (
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
                      <p className="text-sm italic text-foreground leading-relaxed">&ldquo;{f.feedback}&rdquo;</p>
                      <div className="mt-2">
                        <SentimentBadge sentimen={f.sentimen} skor={f.sentimenSkor} />
                      </div>
                      <div className="flex items-center justify-between mt-3">
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

          {/* Navigation */}
          <Link href="/guru/distribusi">
            <Button className="w-full h-11">
              <Truck size={16} className="mr-2" />
              Lihat Semua Distribusi
            </Button>
          </Link>
        </>
      )}

      {/* Image Modal */}
      {selectedFotoUrl && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setSelectedFotoUrl(null)}
        >
          <div className="relative w-full max-w-4xl max-h-[90vh] flex items-center justify-center">
            <Image 
              src={selectedFotoUrl} 
              alt="Foto diperbesar" 
              width={1200} 
              height={1200} 
              className="max-w-full max-h-[90vh] object-contain rounded-md" 
              unoptimized 
            />
          </div>
        </div>
      )}
    </div>
  );
}
