'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Loader2, School, Users, CheckCircle2, Clock, Truck, ChevronRight, UtensilsCrossed, Flame, Beef, Droplets, Wheat, Leaf } from 'lucide-react';
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
}

interface MonitoringData {
  sudahIsi: { userId: string; name: string; kelas: string; statusKonsumsi: string; rating: number | null }[];
  belumIsi: { userId: string; name: string; kelas: string }[];
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

export default function GuruDashboard() {
  const [stats, setStats] = useState<GuruStats | null>(null);
  const [monitoring, setMonitoring] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFotoUrl, setSelectedFotoUrl] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/proxy/dashboard/guru').then((r) => r.ok ? r.json() : Promise.reject('Gagal memuat statistik')),
      fetch('/api/proxy/dashboard/guru/monitoring').then((r) => r.ok ? r.json() : Promise.reject('Gagal memuat monitoring')),
    ])
      .then(([s, m]) => {
        setStats(s?.data ?? s);
        setMonitoring(m?.data ?? m);
      })
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

          {/* Detail monitoring */}
          {monitoring && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {monitoring.sudahIsi.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-green-600">
                      <CheckCircle2 size={14} />
                      Sudah Mengisi ({monitoring.sudahIsi.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                    {monitoring.sudahIsi.map((p) => (
                      <div key={p.userId} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                        <div>
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.kelas}</p>
                        </div>
                        <Badge className={`text-xs border-0 ${p.statusKonsumsi === 'KONSUMSI' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {p.statusKonsumsi === 'KONSUMSI' ? 'Konsumsi' : 'Tidak Konsumsi'}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              {monitoring.belumIsi.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-amber-600">
                      <Clock size={14} />
                      Belum Mengisi ({monitoring.belumIsi.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                    {monitoring.belumIsi.map((p) => (
                      <div key={p.userId} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                        <div>
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.kelas}</p>
                        </div>
                        <Badge className="text-xs border-0 bg-amber-100 text-amber-700">Menunggu</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

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
