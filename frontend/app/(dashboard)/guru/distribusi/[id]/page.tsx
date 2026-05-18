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
import { Badge } from '../../../../../components/ui/Badge';
import { ArrowLeft, Loader2, CheckCircle, AlertTriangle, UtensilsCrossed, Flame, Beef, Droplets, Wheat, Leaf, CalendarDays, Building2 } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'warning' | 'destructive' | 'success' | 'outline' }> = {
  DRAFT: { label: 'Draft', variant: 'outline' },
  DIKIRIM: { label: 'Dalam Perjalanan', variant: 'warning' },
  DITERIMA: { label: 'Diterima', variant: 'success' },
  BERMASALAH: { label: 'Bermasalah', variant: 'destructive' },
  SELESAI: { label: 'Selesai', variant: 'success' },
};

export default function KonfirmasiDistribusiPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();

  const [dist, setDist] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      alert('Harap isi catatan kendala jika ada masalah.');
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
      router.push('/guru/distribusi');
    } catch(e: any) { alert(e.message); }
    setSaving(false);
  };

  if (loading) return <StateCard icon={<Loader2 className="animate-spin text-primary" size={32}/>} title="Memuat Data" description=""/>;
  if (!dist) return <StateCard icon={<ArrowLeft size={32}/>} title="Not Found" description=""/>;

  const menu = dist.menu;
  const fotoSrc = menu?.fotoUrl
    ? (menu.fotoUrl.startsWith('http') ? menu.fotoUrl : `${BACKEND_URL}${menu.fotoUrl}`)
    : null;
  const statusCfg = STATUS_CONFIG[dist.status] || { label: dist.status, variant: 'outline' as const };
  const tanggalStr = new Date(dist.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
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
        <CardContent className="p-6 space-y-5">
          {/* Top: dapur, status, date */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Building2 size={14} />
                Asal Dapur
              </div>
              <div className="font-bold text-lg text-foreground">{dist.dapur?.nama || 'N/A'}</div>
            </div>
            <Badge variant={statusCfg.variant} className="shrink-0 text-sm px-3 py-1">{statusCfg.label}</Badge>
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
                <div className="shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-muted border shadow-sm">
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
            </div>
            <div className="flex gap-3">
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white" 
                disabled={saving} 
                onClick={() => handleKonfirmasi('DITERIMA')}
              >
                <CheckCircle size={18} className="mr-2"/> Terima Makanan
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1" 
                disabled={saving}
                onClick={() => handleKonfirmasi('BERMASALAH')}
              >
                <AlertTriangle size={18} className="mr-2"/> Lapor Masalah
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing catatan guru */}
      {(dist.status === 'DITERIMA' || dist.status === 'BERMASALAH') && dist.catatanGuru && (
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Catatan Anda (Guru)</div>
            <div className="p-3 bg-neutral-50 rounded-lg text-sm italic border text-foreground">
              &ldquo;{dist.catatanGuru}&rdquo;
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
