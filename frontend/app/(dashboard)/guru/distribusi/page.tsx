'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '../../../../components/layout/PageHeader';
import { StateCard } from '../../../../components/layout/StateCard';
import { Card, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Badge } from '../../../../components/ui/Badge';
import { Inbox, Truck, AlertCircle, Loader2 } from 'lucide-react';

export default function GuruDistribusiPage() {
  const [distribusi, setDistribusi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(() => new Date().toISOString().split('T')[0]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/proxy/distribusi/sekolah-saya?tanggal=${filterDate}`);
      const json = await res.json();
      setDistribusi(Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []));
    } catch(e) {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [filterDate]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Distribusi Sekolah" 
        description="Pantau dan konfirmasi penerimaan makanan dari Dapur Utama."
      />

      <div className="bg-white border p-3 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <span className="text-sm font-medium">Filter Tanggal Kedatangan:</span>
        <Input type="date" className="h-9 w-full sm:w-auto" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}/>
      </div>

      <div className="space-y-4 pt-2">
        {loading ? <StateCard icon={<Loader2 className="animate-spin"/>} title="Memuat" description=""/> :
         distribusi.length===0 ? <StateCard icon={<Inbox/>} title="Belum Ada Distribusi" description="Tidak ada jadwal jadwal kiriman MBG pada tanggal ini."/> :
         distribusi.map((d: any) => (
           <Card key={d.id}>
             <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <div className="font-bold flex items-center gap-2 text-lg">
                    {d.dapur?.nama || 'Dapur Utama'}
                  </div>
                  <div className="text-sm text-primary font-medium mt-1">{d.jumlahPorsi} Porsi Makanan</div>
                  <div className="text-sm text-muted-foreground mt-1">Est. Tanggal: {new Date(d.tanggal).toLocaleDateString('id-ID')}</div>
                </div>
                
                <div className="flex flex-col items-end gap-2 shrink-0 w-full sm:w-auto">
                  <Badge variant={d.status === 'DIKIRIM' ? 'warning' : d.status === 'DITERIMA' ? 'default': d.status === 'BERMASALAH' ? 'destructive' : 'outline'}>
                     {d.status}
                  </Badge>
                  {d.status === 'DIKIRIM' && (
                    <Link href={`/guru/distribusi/${d.id}`} className="w-full sm:w-auto">
                      <Button className="w-full">Lakukan Konfirmasi</Button>
                    </Link>
                  )}
                  {(d.status === 'DITERIMA' || d.status === 'BERMASALAH') && (
                    <Link href={`/guru/distribusi/${d.id}`} className="w-full sm:w-auto">
                      <Button variant="outline" className="w-full">Lihat Data</Button>
                    </Link>
                  )}
                </div>
             </CardContent>
           </Card>
         ))
        }
      </div>
    </div>
  );
}
