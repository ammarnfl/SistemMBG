'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PageHeader } from '../../../../components/layout/PageHeader';
import { StateCard } from '../../../../components/layout/StateCard';
import { Card, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { StatusBadge } from '../../../../components/ui/StatusBadge';
import { Inbox, Loader2, UtensilsCrossed, CalendarDays, Flame, Beef, Droplets, Wheat, Leaf, ChevronRight } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function NutritionTag({ value, unit, label, color }: { value: number | null; unit: string; label: string; color: string }) {
  if (value == null) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
      {value}{unit} {label}
    </span>
  );
}

export default function GuruDistribusiPage() {
  const [distribusi, setDistribusi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedFotoUrl, setSelectedFotoUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/proxy/distribusi/sekolah-saya?tanggal=${filterDate}`);
      if (!res.ok) throw new Error('Gagal memuat distribusi');
      const json = await res.json();
      setDistribusi(Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []));
    } catch(e: any) { setError(e.message || 'Gagal memuat distribusi'); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [filterDate]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Distribusi Sekolah" 
        description="Pantau dan konfirmasi penerimaan makanan dari Dapur Utama."
      />

      <div className="bg-white border px-4 py-3 rounded-lg flex flex-row items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground shrink-0">
          <CalendarDays size={16} className="text-primary" />
          <span>Tanggal Distribusi:</span>
        </div>
        <Input type="date" className="h-9 w-auto" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}/>
      </div>

      <div className="space-y-4 pt-2">
        {loading ? <StateCard icon={<Loader2 className="animate-spin"/>} title="Memuat" description=""/> :
         error ? <StateCard icon={<Inbox/>} title="Gagal Memuat" description={error} action={<Button variant="outline" onClick={loadData}>Coba Lagi</Button>}/> :
         distribusi.length===0 ? <StateCard icon={<Inbox/>} title="Belum Ada Distribusi" description="Tidak ada jadwal kiriman MBG pada tanggal ini."/> :
         distribusi.map((d: any) => {
           const menu = d.menu;
           const fotoSrc = menu?.fotoUrl
             ? (menu.fotoUrl.startsWith('http') ? menu.fotoUrl : `${BACKEND_URL}${menu.fotoUrl}`)
             : null;
           const tanggalStr = new Date(d.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

           return (
             <Card key={d.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
               <CardContent className="p-0">
                 <div className="flex flex-col sm:flex-row">
                   {/* Menu image section */}
                   <div className="sm:w-36 sm:min-h-full shrink-0">
                     {fotoSrc ? (
                       <div 
                         className="w-full h-32 sm:h-full relative cursor-pointer group"
                         onClick={() => setSelectedFotoUrl(fotoSrc)}
                       >
                         <Image src={fotoSrc} alt={menu?.nama || ''} fill className="object-cover group-hover:brightness-90 transition-all" unoptimized />
                       </div>
                     ) : (
                       <div className="w-full h-32 sm:h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                         <UtensilsCrossed size={32} className="text-primary/30" />
                       </div>
                     )}
                   </div>
                   {/* Content section */}
                   <div className="flex-1 p-4 sm:p-5 flex flex-col gap-3">
                     {/* Top row: dapur name + status */}
                     <div className="flex items-start justify-between gap-3">
                       <div className="min-w-0">
                         <div className="font-bold text-lg text-foreground leading-tight">
                           {d.dapur?.nama || 'Dapur Utama'}
                         </div>
                         <div className="text-xs text-muted-foreground mt-0.5">
                           {tanggalStr}
                         </div>
                       </div>
                       <StatusBadge status={d.status} className="shrink-0" />
                     </div>

                     {/* Menu info */}
                     {menu ? (
                       <div className="space-y-2">
                         <div>
                           <p className="text-sm font-semibold text-foreground">{menu.nama}</p>
                           {menu.deskripsi && (
                             <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{menu.deskripsi}</p>
                           )}
                         </div>
                         <div className="text-sm text-primary font-semibold">{d.jumlahPorsi} Porsi</div>

                         {/* Nutrition tags */}
                         {(menu.energiKkal || menu.proteinGram || menu.lemakGram || menu.karbohidratGram || menu.seratGram) && (
                           <div className="flex flex-wrap gap-1.5">
                             <NutritionTag value={menu.energiKkal} unit=" kkal" label="" color="bg-orange-50 text-orange-700" />
                             <NutritionTag value={menu.proteinGram} unit="g" label="protein" color="bg-red-50 text-red-700" />
                             <NutritionTag value={menu.lemakGram} unit="g" label="lemak" color="bg-yellow-50 text-yellow-700" />
                             <NutritionTag value={menu.karbohidratGram} unit="g" label="karbo" color="bg-amber-50 text-amber-700" />
                             <NutritionTag value={menu.seratGram} unit="g" label="serat" color="bg-green-50 text-green-700" />
                           </div>
                         )}

                         {/* Komponen preview */}
                         {menu.komponen && menu.komponen.length > 0 && (
                           <div className="flex flex-wrap gap-1.5">
                             {menu.komponen.map((k: any) => (
                               <span key={k.id} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full border border-neutral-200">
                                 {k.namaSnapshot || k.nama}
                               </span>
                             ))}
                           </div>
                         )}
                       </div>
                     ) : (
                       <div className="text-sm text-primary font-semibold">{d.jumlahPorsi} Porsi Makanan</div>
                     )}

                     {/* Action buttons */}
                     <div className="flex gap-2 mt-auto pt-1">
                       {d.status === 'DIKIRIM' && (
                         <Link href={`/guru/distribusi/${d.id}`} className="flex-1 sm:flex-none">
                           <Button className="w-full sm:w-auto gap-1" size="sm">Lakukan Konfirmasi <ChevronRight size={14} /></Button>
                         </Link>
                       )}
                       {(d.status === 'DITERIMA' || d.status === 'BERMASALAH' || d.status === 'SELESAI') && (
                         <Link href={`/guru/distribusi/${d.id}`} className="flex-1 sm:flex-none">
                           <Button variant="outline" className="w-full sm:w-auto gap-1" size="sm">Lihat Detail <ChevronRight size={14} /></Button>
                         </Link>
                       )}
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>
           );
         })
        }
      </div>
    </div>
  );
}
