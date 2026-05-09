'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Loader2, School, Users, CheckCircle2, Clock, Truck, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface GuruStats {
  sekolah: { id: string; nama: string } | null;
  distribusiHariIni: {
    id: string;
    status: string;
    jumlahPorsi: number;
    menu: { nama: string } | null;
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

export default function GuruDashboard() {
  const [stats, setStats] = useState<GuruStats | null>(null);
  const [monitoring, setMonitoring] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
          {/* Distribusi hari ini */}
          <Card className={`border-l-4 ${stats.distribusiHariIni ? 'border-l-primary' : 'border-l-muted'}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Truck size={16} className="text-primary" />
                Distribusi Hari Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.distribusiHariIni ? (
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">{stats.distribusiHariIni.menu?.nama || 'Menu tidak diset'}</p>
                      <p className="text-sm text-muted-foreground">{stats.distribusiHariIni.jumlahPorsi} porsi</p>
                    </div>
                    {statusDistribusi && (
                      <Badge className={`${statusDistribusi.color} border-0 shrink-0`}>{statusDistribusi.label}</Badge>
                    )}
                  </div>
                  <Link href={`/guru/distribusi/${stats.distribusiHariIni.id}`}>
                    <Button variant="outline" size="sm" className="mt-2 gap-1">
                      Lihat Detail <ChevronRight size={14} />
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
    </div>
  );
}
