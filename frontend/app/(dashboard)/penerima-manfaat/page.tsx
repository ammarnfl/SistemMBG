'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Loader2, Utensils, CheckCircle2, Clock, Star, CalendarDays, ChevronRight, AlertCircle, Info, Flame, Beef, Droplets, Wheat, Leaf } from 'lucide-react';
import Image from 'next/image';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function NutritionPill({ icon, label, value, unit, color }: { icon: React.ReactNode; label: string; value: number | null | undefined; unit: string; color: string }) {
  if (value == null) return null;
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${color} text-xs font-medium`}>
      {icon}
      <span>{value}{unit}</span>
    </div>
  );
}

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
  status: string;
  menu: { 
    nama: string; 
    deskripsi?: string; 
    fotoUrl?: string | null;
    energiKkal?: number | null;
    proteinGram?: number | null;
    lemakGram?: number | null;
    karbohidratGram?: number | null;
    seratGram?: number | null;
    komponen: { id: string; namaSnapshot: string; }[] 
  };
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
  const [selectedFotoUrl, setSelectedFotoUrl] = useState<string | null>(null);
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
    <div className="max-w-md mx-auto space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
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
        stats.sudahIsiHariIni ? (
          <Card className="border-l-4 border-l-green-400 bg-green-50/30">
            <div className="p-4 flex items-center gap-3">
              <CheckCircle2 size={24} className="text-green-600 shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Evaluasi Hari Ini Sudah Diisi</p>
                {stats.evaluasiHariIni && (
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`text-xs border-0 ${stats.evaluasiHariIni.statusKonsumsi === 'KONSUMSI' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {stats.evaluasiHariIni.statusKonsumsi === 'KONSUMSI' ? 'Dikonsumsi' : 'Tidak Dikonsumsi'}
                    </Badge>
                    <StarRow value={stats.evaluasiHariIni.ratingKeseluruhan} />
                  </div>
                )}
              </div>
            </div>
          </Card>
        ) : distribusi && (distribusi.status === 'DITERIMA' || distribusi.status === 'SELESAI' || distribusi.status === 'BERMASALAH') ? (
          <Card className="border-l-4 border-l-amber-500 bg-amber-50 shadow-sm mt-4">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <Clock size={24} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-amber-900">Belum Mengisi Evaluasi</p>
                  <p className="text-sm text-amber-700 mt-0.5 leading-tight">Anda belum mengisi evaluasi makanan untuk hari ini. Mohon segera isi.</p>
                  <Button 
                    size="sm" 
                    className="w-full mt-3 bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                    onClick={() => router.push(`/penerima-manfaat/evaluasi?distribusiId=${distribusi.id}&tanggal=${distribusi.tanggal}`)}
                  >
                    Isi Evaluasi Sekarang
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ) : null
      )}

      {/* Menu Hari Ini */}
      {!distribusi ? (
        <Card className="border-dashed">
          <div className="flex flex-col items-center justify-center p-10 text-center text-muted-foreground">
            <div className="p-4 bg-muted/50 rounded-full mb-3">
              <Utensils size={28} className="text-muted-foreground/70" />
            </div>
            <p className="font-medium text-foreground">Belum ada makanan hari ini</p>
            <p className="text-sm mt-1">Tidak ada distribusi makanan untuk sekolah Anda.</p>
          </div>
        </Card>
      ) : (
        <Card className="shadow-md border-primary/20 overflow-hidden relative">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50" />
          
          {distribusi.menu.fotoUrl && (
            <div 
              className="w-full h-48 bg-muted border-b border-border/50 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setSelectedFotoUrl(
                distribusi.menu.fotoUrl!.startsWith('http') ? distribusi.menu.fotoUrl! : `${BACKEND_URL}${distribusi.menu.fotoUrl}`
              )}
            >
              <img 
                src={distribusi.menu.fotoUrl.startsWith('http') ? distribusi.menu.fotoUrl : `${BACKEND_URL}${distribusi.menu.fotoUrl}`} 
                alt={distribusi.menu.nama} 
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
          )}

          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-xl text-primary font-black tracking-tight">{distribusi.menu.nama}</CardTitle>
                <p className="text-xs font-semibold text-muted-foreground mt-1 uppercase tracking-widest">Dapur: {distribusi.dapur.nama}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {distribusi.menu.deskripsi && (
              <p className="text-sm text-foreground/80 leading-relaxed border-l-2 border-primary/30 pl-3 italic">
                "{distribusi.menu.deskripsi}"
              </p>
            )}
            
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Utensils size={14} /> Komposisi Menu
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {distribusi.menu.komponen.map((komp) => (
                  <Badge key={komp.id} variant="secondary" className="font-medium bg-muted/50 text-foreground border-border/60">
                    {komp.namaSnapshot}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Nilai Gizi Section */}
            {(distribusi.menu.energiKkal !== null || distribusi.menu.proteinGram !== null || distribusi.menu.lemakGram !== null || distribusi.menu.karbohidratGram !== null || distribusi.menu.seratGram !== null) && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Info size={14} /> Nilai Gizi per Porsi
                </h4>
                <div className="flex flex-wrap gap-2">
                  <NutritionPill icon={<Flame size={12} />} label="Energi" value={distribusi.menu.energiKkal} unit=" kkal" color="bg-orange-50 text-orange-700 border border-orange-100" />
                  <NutritionPill icon={<Beef size={12} />} label="Protein" value={distribusi.menu.proteinGram} unit="g" color="bg-red-50 text-red-700 border border-red-100" />
                  <NutritionPill icon={<Droplets size={12} />} label="Lemak" value={distribusi.menu.lemakGram} unit="g" color="bg-yellow-50 text-yellow-700 border border-yellow-100" />
                  <NutritionPill icon={<Wheat size={12} />} label="Karbo" value={distribusi.menu.karbohidratGram} unit="g" color="bg-amber-50 text-amber-700 border border-amber-100" />
                  <NutritionPill icon={<Leaf size={12} />} label="Serat" value={distribusi.menu.seratGram} unit="g" color="bg-green-50 text-green-700 border border-green-100" />
                </div>
              </div>
            )}
            
          </CardContent>
          <CardFooter className="pt-4 bg-muted/10 border-t flex-col gap-2">
            {stats?.sudahIsiHariIni ? (
              <Button variant="outline" className="w-full h-11" onClick={() => router.push('/penerima-manfaat/riwayat')}>
                <CheckCircle2 size={16} className="mr-2 text-green-600" />
                Lihat Riwayat Evaluasi
              </Button>
            ) : distribusi.status === 'DITERIMA' || distribusi.status === 'SELESAI' ? (
              <Button
                className="w-full h-11 font-medium shadow-sm group"
                onClick={() => router.push(`/penerima-manfaat/evaluasi?distribusiId=${distribusi.id}&tanggal=${distribusi.tanggal}`)}
              >
                Isi Evaluasi Makanan
                <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : (
              <div className="w-full text-center p-3 rounded-lg bg-amber-50 border border-amber-100 flex flex-col items-center gap-1">
                <Clock size={18} className="text-amber-500" />
                <p className="text-sm font-medium text-amber-700">Belum Bisa Mengisi Evaluasi</p>
                <p className="text-xs text-amber-600">Menunggu guru mengonfirmasi distribusi makanan ini.</p>
              </div>
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

      {/* Image Modal */}
      {selectedFotoUrl && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setSelectedFotoUrl(null)}
        >
          <div className="relative w-full max-w-4xl max-h-[90vh] flex items-center justify-center">
            <img 
              src={selectedFotoUrl} 
              alt="Foto diperbesar" 
              className="max-w-full max-h-[90vh] object-contain rounded-md" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
