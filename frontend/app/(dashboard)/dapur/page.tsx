'use client';
import Link from 'next/link';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { UtensilsCrossed, CheckCircle2 } from 'lucide-react';

export default function DapurDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Dashboard Tim Dapur" 
        description="Selamat datang di panel pengelolaan Dapur Utama. Menu operasional hari ini."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-primary/10 p-4 rounded-full text-primary">
              <UtensilsCrossed size={32} />
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Status Dapur</div>
              <div className="text-2xl font-bold text-foreground">Siap Operasi</div>
            </div>
          </CardContent>
        </Card>
        <Link href="/dapur/jadwal" className="block">
          <Card className="hover:border-primary hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-green-100 p-4 rounded-full text-green-600">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Jadwal Hari Ini</div>
                <div className="text-2xl font-bold text-foreground">Aktif</div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <Link href="/dapur/menu" className="block">
           <Button variant="outline" className="w-full h-12 justify-start gap-3">
             <UtensilsCrossed size={18} /> Kelola Menu Master
           </Button>
        </Link>
        <Link href="/dapur/distribusi" className="block">
           <Button variant="outline" className="w-full h-12 justify-start gap-3">
             <CheckCircle2 size={18} /> Distribusi & Pengiriman
           </Button>
        </Link>
      </div>
    </div>
  );
}
