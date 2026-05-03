'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../../../components/layout/PageHeader';
import { StateCard } from '../../../../../components/layout/StateCard';
import { Card, CardContent } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import { Badge } from '../../../../../components/ui/Badge';
import { ArrowLeft, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl mx-auto">
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
        description="Periksa porsi yang datang dan lakukan konfirmasi ke dapur."
      />

      <Card>
        <CardContent className="p-6 space-y-4">
           <div className="flex justify-between items-start border-b pb-4">
              <div>
                 <div className="text-sm text-muted-foreground font-medium">Asal Dapur</div>
                 <div className="font-bold text-lg">{dist.dapur?.nama || 'N/A'}</div>
              </div>
              <Badge variant={dist.status==='DITERIMA'?'success': dist.status==='BERMASALAH'?'destructive':'warning'}>{dist.status}</Badge>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div>
                 <div className="text-xs text-muted-foreground">Jumlah Porsi</div>
                 <div className="font-semibold text-lg">{dist.jumlahPorsi} 🍽️</div>
              </div>
              <div>
                 <div className="text-xs text-muted-foreground">Catatan Dapur</div>
                 <div className="font-medium text-sm">{dist.catatanDapur || '-'}</div>
              </div>
           </div>

           {dist.status === 'DIKIRIM' && (
             <div className="pt-4 border-t space-y-4">
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
             </div>
           )}

           {(dist.status === 'DITERIMA' || dist.status === 'BERMASALAH') && dist.catatanGuru && (
             <div className="pt-4 border-t">
                <div className="text-xs text-muted-foreground mb-1">Catatan Anda (Guru)</div>
                <div className="p-3 bg-neutral-50 rounded text-sm italic border">
                  "{dist.catatanGuru}"
                </div>
             </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
