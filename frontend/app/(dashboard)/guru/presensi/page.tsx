'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PageHeader } from '../../../../components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { Badge } from '../../../../components/ui/Badge';
import {
  Loader2, Search, Calendar, CalendarOff, Users, CheckCircle2, XCircle,
  Clock, MessageSquare, UtensilsCrossed, X, ChevronRight, Star,
} from 'lucide-react';

interface FeedbackDetail {
  id: string;
  text: string | null;
  rating: number | null;
  sentimen: 'POSITIF' | 'NETRAL' | 'NEGATIF' | null;
  sentimenSkor: number | null;
  resolved: boolean;
  resolution: string | null;
  resolvedAt: string | null;
}

interface Siswa {
  userId: string;
  name: string;
  kelas: string;
  kelasId: string | null;
  sudahIsi: boolean;
  statusKonsumsi: 'KONSUMSI' | 'TIDAK_KONSUMSI' | null;
  sudahFeedback: boolean;
  feedback: FeedbackDetail | null;
}

interface PresensiData {
  sekolah: { id: string; nama: string } | null;
  adaMBG: boolean;
  tanggal: string | null;
  distribusi: { id: string; status: string; jumlahPorsi: number; menu: string | null } | null;
  siswa: Siswa[];
}

interface KelasOption {
  id: string;
  nama: string;
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
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
      {skor !== null && <span className="opacity-60">({Math.round(skor * 100)}%)</span>}
    </div>
  );
}

function KonsumsiBadge({ status }: { status: Siswa['statusKonsumsi'] }) {
  if (status === 'KONSUMSI') {
    return (
      <Badge className="border-0 bg-green-100 text-green-700 gap-1">
        <CheckCircle2 size={12} /> Konsumsi
      </Badge>
    );
  }
  if (status === 'TIDAK_KONSUMSI') {
    return (
      <Badge className="border-0 bg-red-100 text-red-700 gap-1">
        <XCircle size={12} /> Tidak Konsumsi
      </Badge>
    );
  }
  return (
    <Badge className="border-0 bg-amber-100 text-amber-700 gap-1">
      <Clock size={12} /> Belum Isi
    </Badge>
  );
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function GuruPresensiPage() {
  const [data, setData] = useState<PresensiData | null>(null);
  const [kelasOptions, setKelasOptions] = useState<KelasOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [tanggal, setTanggal] = useState(todayStr());
  const [kelasId, setKelasId] = useState('');

  const [selected, setSelected] = useState<Siswa | null>(null);
  const feedbackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch('/api/proxy/dashboard/guru/kelas')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => setKelasOptions(json?.data ?? json ?? []))
      .catch(() => setKelasOptions([]));
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setSelected(null);
    try {
      const params = new URLSearchParams();
      if (tanggal) params.set('tanggal', tanggal);
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (kelasId) params.set('kelasId', kelasId);

      const res = await fetch(`/api/proxy/dashboard/guru/presensi?${params.toString()}`);
      if (!res.ok) throw new Error('Gagal memuat');
      const json = await res.json();
      setData(json?.data ?? json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [tanggal, debouncedSearch, kelasId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openFeedback = (s: Siswa) => {
    if (!s.sudahFeedback || !s.feedback) return;
    setSelected(s);
    requestAnimationFrame(() => {
      feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const siswa = data?.siswa ?? [];
  const totalSiswa = siswa.length;
  const sudahIsi = siswa.filter((s) => s.sudahIsi).length;
  const sudahFeedback = siswa.filter((s) => s.sudahFeedback).length;

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Presensi & Feedback Siswa"
          description={data?.sekolah ? data.sekolah.nama : 'Pantau konsumsi dan pengisian feedback siswa per tanggal.'}
        />
        {data?.adaMBG && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
            <Users size={16} />
            <span className="font-semibold text-foreground">{sudahIsi}</span> / {totalSiswa} mengisi
          </div>
        )}
      </div>

      {/* Filters */}
      <Card className="border-border/50 shadow-sm">
        <div className="p-5 space-y-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Cari nama siswa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-muted-foreground shrink-0" />
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="text-xs bg-white border border-border/60 rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
            </div>

            <select
              value={kelasId}
              onChange={(e) => setKelasId(e.target.value)}
              className="text-xs bg-white border border-border/60 rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-all min-w-[150px]"
            >
              <option value="">Semua Kelas</option>
              {kelasOptions.map((k) => (
                <option key={k.id} value={k.id}>{k.nama}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* MBG menu banner */}
      {!loading && data?.adaMBG && data.distribusi && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/15 text-sm">
          <UtensilsCrossed size={16} className="text-primary shrink-0" />
          <span className="text-foreground">
            Menu: <span className="font-semibold">{data.distribusi.menu || 'Tidak diset'}</span>
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{data.distribusi.jumlahPorsi} porsi</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {sudahFeedback} feedback masuk
          </span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-48 gap-3">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-sm text-muted-foreground animate-pulse">Memuat presensi...</p>
        </div>
      ) : !data?.sekolah ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground text-center">
            <Users size={36} className="mb-3 opacity-30" />
            <p className="text-sm font-medium text-foreground">Belum dipetakan ke sekolah</p>
            <p className="text-xs mt-1">Minta Admin untuk menghubungkan akun Anda ke sekolah terlebih dahulu.</p>
          </CardContent>
        </Card>
      ) : !data.adaMBG ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground text-center">
            <div className="p-4 rounded-full bg-muted/50 mb-3">
              <CalendarOff size={28} className="opacity-40" />
            </div>
            <p className="text-base font-semibold text-foreground">Tidak ada MBG</p>
            <p className="text-sm mt-1">
              Tidak ada jadwal distribusi makanan pada{' '}
              {new Date(tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.
            </p>
          </CardContent>
        </Card>
      ) : siswa.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground text-center">
            <Users size={28} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">Tidak ada siswa ditemukan</p>
            <p className="text-xs mt-1">Coba ubah filter pencarian atau kelas.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30 text-left">
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Nama</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Kelas</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Presensi Konsumsi</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Feedback</th>
                </tr>
              </thead>
              <tbody>
                {siswa.map((s) => {
                  const clickable = s.sudahFeedback;
                  return (
                    <tr
                      key={s.userId}
                      onClick={() => openFeedback(s)}
                      className={`border-b border-border/30 last:border-0 transition-colors ${
                        clickable ? 'cursor-pointer hover:bg-primary/5' : ''
                      } ${selected?.userId === s.userId ? 'bg-primary/10' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                            {s.name.charAt(0)}
                          </div>
                          <span className="font-medium text-foreground">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{s.kelas}</td>
                      <td className="px-4 py-3"><KonsumsiBadge status={s.statusKonsumsi} /></td>
                      <td className="px-4 py-3">
                        {s.sudahFeedback ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 group">
                            <MessageSquare size={13} /> Sudah
                            <ChevronRight size={13} className="opacity-50" />
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Belum</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Feedback detail section */}
      <div ref={feedbackRef} className="scroll-mt-6">
        {selected && selected.feedback && (
          <Card className="border-blue-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-50">
                    <MessageSquare size={18} className="text-blue-500" />
                  </div>
                  Detail Feedback
                </CardTitle>
                <button
                  onClick={() => setSelected(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  aria-label="Tutup"
                >
                  <X size={16} />
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Student */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{selected.name}</p>
                  <p className="text-xs text-muted-foreground">{selected.kelas}</p>
                </div>
              </div>

              {/* Feedback text */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/40">
                <p className="text-sm italic text-foreground leading-relaxed">
                  &ldquo;{selected.feedback.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <SentimentBadge sentimen={selected.feedback.sentimen} skor={selected.feedback.sentimenSkor} />
                  {selected.feedback.rating != null && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      {selected.feedback.rating}/5
                    </span>
                  )}
                </div>
              </div>

              {/* Resolution */}
              {selected.feedback.resolved && selected.feedback.resolution && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-3 space-y-1">
                  <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 size={10} /> Tanggapan Tim Dapur
                  </p>
                  <p className="text-xs text-green-800 leading-relaxed">{selected.feedback.resolution}</p>
                  {selected.feedback.resolvedAt && (
                    <p className="text-[9px] text-green-500">
                      {new Date(selected.feedback.resolvedAt).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
