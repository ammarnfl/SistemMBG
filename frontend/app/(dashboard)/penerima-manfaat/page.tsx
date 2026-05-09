'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Loader2, Utensils, CheckCircle2, Clock, Star, CalendarDays, ChevronRight, AlertCircle } from 'lucide-react';

interface PMStats {
  sudahIsiHariIni: boolean;
  evaluasiHariIni: {
    statusKonsumsi: string;
    ratingKeseluruhan: number | null;
    feedback: string | null;
  } | null;
  riwayat7Hari: {
    tanggal: string;
    statusKonsumsi: string;
    rating: number | null;
    namaMenu: string;
  }[];
}

interface MenuHariIni {
  id: string;
  tanggal: string;
  menu: { nama: string; deskripsi?: string; komponen: { id: string; nama: string; porsi?: string }[] };
  dapur: { nama: string };
}

function StarRow({ value, max = 5 }: { value: number | null; max?: number }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} size={12} className={i < value ? 'text-amber-400 fill-amber-400' : 'text-muted/40'} />
      ))}
    </div>
  );
}

export default function BerandaPenerimaManfaat() {
  const [stats, setStats] = useState<PMStats | null>(null);
  const [distribusi, setDistribusi] = useState<MenuHariIni | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const todayStr = new Date().toLocaleDateString('sv-SE');
    Promise.all([
      fetch('/api/proxy/dashboard/pm').then((r) => r.ok ? r.json() : Promise.reject('Gagal memuat status evaluasi')),
      fetch(`/api/proxy/evaluasi/today?date=${todayStr}`).then((r) => r.ok ? r.json() : null),
    ])
      .then(([pmStats, menuData]) => {
        setStats(pmStats?.data ?? pmStats);
        const raw = menuData?.data !== undefined ? menuData.data : menuData;
        setDistribusi(raw || null);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  const tanggalHariIni = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="max-w-md mx-auto space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Beranda</h1>
        <p className="text-muted-foreground text-sm mt-1">{tanggalHariIni}</p>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive flex gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            {error}
          </CardContent>
        </Card>
      )}

      {/* Status Pengisian Hari Ini */}
      {stats && (
        <Card className={`border-l-4 ${stats.sudahIsiHariIni ? 'border-l-green-400 bg-green-50/30' : 'border-l-amber-400 bg-amber-50/30'}`}>
          <CardContent className="p-4 flex items-center gap-3">
            {stats.sudahIsiHariIni
              ? <CheckCircle2 size={24} className="text-green-600 shrink-0" />
              : <Clock size={24} className="text-amber-600 shrink-0" />
            }
            <div>
              <p className="font-semibold text-foreground">
                {stats.sudahIsiHariIni ? 'Evaluasi Hari Ini Sudah Diisi' : 'Belum Mengisi Evaluasi Hari Ini'}
              </p>
              {stats.evaluasiHariIni && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`text-xs border-0 ${stats.evaluasiHariIni.statusKonsumsi === 'KONSUMSI' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {stats.evaluasiHariIni.statusKonsumsi === 'KONSUMSI' ? 'Dikonsumsi' : 'Tidak Dikonsumsi'}
                  </Badge>
                  <StarRow value={stats.evaluasiHariIni.ratingKeseluruhan} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Menu Hari Ini */}
      {!distribusi ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-10 text-center text-muted-foreground">
            <div className="p-4 bg-muted/50 rounded-full mb-3">
              <Utensils size={28} className="text-muted-foreground/70" />
            </div>
            <p className="font-medium text-foreground">Belum ada makanan hari ini</p>
            <p className="text-sm mt-1">Tidak ada distribusi makanan untuk sekolah Anda.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-md border-primary/20 overflow-hidden relative">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50" />
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-lg text-primary">{distribusi.menu.nama}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Dari: {distribusi.dapur.nama}</p>
              </div>
              <Badge className="bg-primary/10 text-primary border-0 text-xs shrink-0">Hari Ini</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {distribusi.menu.deskripsi && (
              <p className="text-sm text-muted-foreground">{distribusi.menu.deskripsi}</p>
            )}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Komponen Menu</h4>
              <div className="grid gap-1.5">
                {distribusi.menu.komponen.map((komp) => (
                  <div key={komp.id} className="flex justify-between items-center p-2.5 bg-muted/30 rounded-lg border border-border/40">
                    <p className="text-sm font-medium">{komp.nama}</p>
                    {komp.porsi && <span className="text-xs font-medium px-2 py-0.5 bg-background rounded-md border shadow-sm">{komp.porsi}</span>}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-3 bg-muted/10 border-t">
            {stats?.sudahIsiHariIni ? (
              <Button variant="outline" className="w-full h-11" onClick={() => router.push('/penerima-manfaat/riwayat')}>
                <CheckCircle2 size={16} className="mr-2 text-green-600" />
                Lihat Riwayat Evaluasi
              </Button>
            ) : (
              <Button
                className="w-full h-11 font-medium shadow-sm"
                onClick={() => router.push(`/penerima-manfaat/evaluasi?distribusiId=${distribusi.id}&tanggal=${distribusi.tanggal}`)}
              >
                Isi Evaluasi Makanan
                <ChevronRight size={16} className="ml-1" />
              </Button>
            )}
          </CardFooter>
        </Card>
      )}

      {/* Riwayat 7 Hari */}
      {stats && stats.riwayat7Hari.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CalendarDays size={14} className="text-primary" />
              Riwayat 7 Hari Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.riwayat7Hari.map((r, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                <div>
                  <p className="text-sm font-medium">{r.namaMenu}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs border-0 ${r.statusKonsumsi === 'KONSUMSI' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {r.statusKonsumsi === 'KONSUMSI' ? '✓' : '✗'}
                  </Badge>
                  <StarRow value={r.rating} />
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="pt-2 border-t">
            <Button variant="ghost" size="sm" className="w-full text-primary gap-1" onClick={() => router.push('/penerima-manfaat/riwayat')}>
              Lihat Semua Riwayat <ChevronRight size={14} />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
