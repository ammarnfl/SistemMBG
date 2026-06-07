'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../../../components/layout/PageHeader';
import { StateCard } from '../../../../../components/layout/StateCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import { StatusBadge } from '../../../../../components/ui/StatusBadge';
import { toast } from '../../../../../components/ui/Toast';
import { ImageLightbox } from '../../../../../components/ui/ImageLightbox';
import { ArrowLeft, Loader2, CheckCircle, AlertTriangle, UtensilsCrossed, Flame, Beef, Droplets, Wheat, Leaf, CalendarDays, Building2, MessageSquarePlus, Trash2, Tag } from 'lucide-react';

import { resolveImgUrl } from '../../../../../lib/image-url';

// STATUS distribusi kini via components/ui/StatusBadge

export default function KonfirmasiDistribusiPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();

  const [dist, setDist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFotoUrl, setSelectedFotoUrl] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/proxy/distribusi/${id}`);
      if (res.ok) {
        const json = await res.json();
        setDist(json?.data || json);
      }
    } catch(e) {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [id]);

  const [catatan, setCatatan] = useState('');
  const [saving, setSaving] = useState(false);

  const handleKonfirmasi = async (statusId: string) => {
    if (statusId === 'BERMASALAH' && !catatan) {
      toast.warning('Harap isi catatan kendala jika ada masalah.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/proxy/distribusi/${id}/konfirmasi`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusId, catatanGuru: catatan })
      });
      if(!res.ok) throw new Error('Gagal melakukan konfirmasi');
      toast.success(statusId === 'DITERIMA' ? 'Makanan dikonfirmasi diterima' : 'Masalah dilaporkan ke dapur');
      router.push('/guru/distribusi');
    } catch(e: any) { toast.error(e.message); }
    setSaving(false);
  };

  // ── Observasi / komentar guru tentang makanan hari ini (F.10) ──
  const [observasi, setObservasi] = useState<any[]>([]);
  const [obsText, setObsText] = useState('');
  const [obsSubmitting, setObsSubmitting] = useState(false);

  const loadObservasi = async () => {
    try {
      const res = await fetch(`/api/proxy/observasi?distribusiId=${id}`);
      if (res.ok) {
        const json = await res.json();
        setObservasi(json?.data || json || []);
      }
    } catch {}
  };

  useEffect(() => { loadObservasi(); }, [id]);

  const handleSubmitObservasi = async () => {
    if (!obsText.trim()) { toast.warning('Tulis komentar Anda dulu.'); return; }
    setObsSubmitting(true);
    try {
      const res = await fetch('/api/proxy/observasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ distribusiId: id, isi: obsText }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Gagal mengirim komentar'); }
      toast.success('Komentar terkirim ke tim dapur');
      setObsText('');
      loadObservasi();
    } catch (e: any) { toast.error(e.message); }
    setObsSubmitting(false);
  };

  const handleDeleteObservasi = async (obsId: string) => {
    try {
      const res = await fetch(`/api/proxy/observasi/${obsId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus');
      toast.success('Komentar dihapus');
      loadObservasi();
    } catch (e: any) { toast.error(e.message); }
  };

  if (loading) return <StateCard icon={<Loader2 className="animate-spin text-primary" size={32}/>} title="Memuat Data" description=""/>;
  if (!dist) return <StateCard icon={<ArrowLeft size={32}/>} title="Not Found" description=""/>;

  const menu = dist.menu;
  const fotoSrc = menu?.fotoUrl ? resolveImgUrl(menu.fotoUrl) : null;
  const tanggalStr = new Date(dist.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <Link href="/guru/distribusi">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <span className="text-sm font-medium text-muted-foreground mr-auto">Kembali</span>
      </div>

      <PageHeader 
        title="Detail Kedatangan Makanan" 
        description="Periksa menu dan porsi yang datang, lalu lakukan konfirmasi."
      />

      {/* Status & Info Card */}
      <Card>
        <CardContent className="pt-6 space-y-5">
          {/* Top: dapur, status, date */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Building2 size={14} />
                Asal Dapur
              </div>
              <div className="font-bold text-lg text-foreground">{dist.dapur?.nama || 'N/A'}</div>
            </div>
            <StatusBadge status={dist.status} className="shrink-0 text-sm px-3 py-1" />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-4">
            <CalendarDays size={14} className="text-primary" />
            <span>Tanggal Distribusi: <span className="font-medium text-foreground">{tanggalStr}</span></span>
          </div>

          {/* Porsi info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
              <div className="text-xs text-muted-foreground mb-1">Jumlah Porsi</div>
              <div className="font-bold text-xl text-primary">{dist.jumlahPorsi} 🍽️</div>
            </div>
            <div className="p-3 bg-neutral-50 rounded-lg border">
              <div className="text-xs text-muted-foreground mb-1">Catatan Dapur</div>
              <div className="font-medium text-sm text-foreground">{dist.catatanDapur || '-'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Detail Card */}
      {menu && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UtensilsCrossed size={16} className="text-primary" />
              Detail Menu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Menu hero with photo */}
            <div className="flex gap-4">
              {fotoSrc ? (
                <div 
                  className="shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-muted border shadow-sm cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                  onClick={() => setSelectedFotoUrl(fotoSrc)}
                >
                  <Image src={fotoSrc} alt={menu.nama} width={96} height={96} className="w-full h-full object-cover" unoptimized />
                </div>
              ) : (
                <div className="shrink-0 w-24 h-24 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border flex items-center justify-center">
                  <UtensilsCrossed size={32} className="text-primary/30" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg text-foreground">{menu.nama}</p>
                {menu.deskripsi && (
                  <p className="text-sm text-muted-foreground mt-1">{menu.deskripsi}</p>
                )}
              </div>
            </div>

            {/* Nutritional info */}
            {(menu.energiKkal || menu.proteinGram || menu.lemakGram || menu.karbohidratGram || menu.seratGram) && (
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">Nilai Gizi per Porsi</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {menu.energiKkal != null && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-orange-50 border border-orange-100">
                      <Flame size={14} className="text-orange-600" />
                      <div>
                        <p className="text-sm font-bold text-orange-700">{menu.energiKkal}</p>
                        <p className="text-[10px] text-orange-600 uppercase">Kkal</p>
                      </div>
                    </div>
                  )}
                  {menu.proteinGram != null && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 border border-red-100">
                      <Beef size={14} className="text-red-600" />
                      <div>
                        <p className="text-sm font-bold text-red-700">{menu.proteinGram}g</p>
                        <p className="text-[10px] text-red-600 uppercase">Protein</p>
                      </div>
                    </div>
                  )}
                  {menu.lemakGram != null && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-yellow-50 border border-yellow-100">
                      <Droplets size={14} className="text-yellow-600" />
                      <div>
                        <p className="text-sm font-bold text-yellow-700">{menu.lemakGram}g</p>
                        <p className="text-[10px] text-yellow-600 uppercase">Lemak</p>
                      </div>
                    </div>
                  )}
                  {menu.karbohidratGram != null && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-100">
                      <Wheat size={14} className="text-amber-600" />
                      <div>
                        <p className="text-sm font-bold text-amber-700">{menu.karbohidratGram}g</p>
                        <p className="text-[10px] text-amber-600 uppercase">Karbo</p>
                      </div>
                    </div>
                  )}
                  {menu.seratGram != null && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-50 border border-green-100">
                      <Leaf size={14} className="text-green-600" />
                      <div>
                        <p className="text-sm font-bold text-green-700">{menu.seratGram}g</p>
                        <p className="text-[10px] text-green-600 uppercase">Serat</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Komponen list */}
            {menu.komponen && menu.komponen.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">Komponen Menu ({menu.komponen.length})</p>
                <div className="space-y-2">
                  {menu.komponen.map((k: any) => (
                    <div key={k.id} className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                      <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{k.namaSnapshot || k.nama}</p>
                        {(k.komponenMaster?.deskripsi || k.deskripsi) && (
                          <p className="text-xs text-muted-foreground mt-0.5">{k.komponenMaster?.deskripsi || k.deskripsi}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Konfirmasi section */}
      {dist.status === 'DIKIRIM' && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Konfirmasi Penerimaan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold block mb-2">Catatan Keadaan Makanan</label>
              <Input
                placeholder="Tulis jika makanan ada yang tumpah, kurang, atau basi..."
                value={catatan}
                onChange={e=>setCatatan(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1.5">Catatan wajib diisi jika Anda melaporkan masalah.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <Button
                className="h-11 gap-2 bg-green-600 hover:bg-green-700 text-white"
                disabled={saving}
                onClick={() => handleKonfirmasi('DITERIMA')}
              >
                <CheckCircle size={18} /> Terima Makanan
              </Button>
              <Button
                variant="destructive"
                className="h-11 gap-2"
                disabled={saving}
                onClick={() => handleKonfirmasi('BERMASALAH')}
              >
                <AlertTriangle size={18} /> Lapor Masalah
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing catatan guru */}
      {(dist.status === 'DITERIMA' || dist.status === 'BERMASALAH') && dist.catatanGuru && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Catatan Anda (Guru)</div>
            <div className="p-3 bg-neutral-50 rounded-lg text-sm italic border text-foreground">
              &ldquo;{dist.catatanGuru}&rdquo;
            </div>
          </CardContent>
        </Card>
      )}

      {/* Observasi / Komentar Guru (F.10) — tersedia di status apa pun */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquarePlus size={16} className="text-primary" />
            Komentar tentang Makanan Hari Ini
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Sampaikan observasi tambahan (mis. rasa, porsi, atau keterlambatan). Komentar ini akan dilihat tim dapur.
          </p>
          <textarea
            value={obsText}
            onChange={(e) => setObsText(e.target.value)}
            placeholder="Tulis komentar Anda tentang makanan hari ini..."
            maxLength={1000}
            className="w-full min-h-[90px] rounded-lg border border-border/60 bg-white px-3 py-2 text-sm focus:ring-1 focus:ring-primary/30 focus:border-primary/50 resize-none transition-all"
          />
          <Button disabled={obsSubmitting || !obsText.trim()} onClick={handleSubmitObservasi} className="w-full sm:w-auto">
            {obsSubmitting ? <><Loader2 size={16} className="mr-2 animate-spin" /> Mengirim...</> : 'Kirim Komentar'}
          </Button>

          {observasi.length > 0 && (
            <div className="space-y-2 pt-3 border-t">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Komentar Anda</p>
              {observasi.map((o) => (
                <div key={o.id} className="p-3 bg-neutral-50 rounded-lg border text-sm group/obs">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-foreground italic flex-1">&ldquo;{o.isi}&rdquo;</p>
                    <button
                      onClick={() => handleDeleteObservasi(o.id)}
                      className="text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover/obs:opacity-100 shrink-0"
                      title="Hapus komentar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {o.kategori && o.kategori.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-2">
                      {o.kategori.map((k: string) => (
                        <span key={k} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200/60">
                          <Tag size={8} /> {k}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ImageLightbox src={selectedFotoUrl} alt="Foto menu" onClose={() => setSelectedFotoUrl(null)} />
    </div>
  );
}
