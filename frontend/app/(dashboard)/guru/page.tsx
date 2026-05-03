'use client';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Card, CardContent } from '../../../components/ui/Card';
import { School, CheckCircle } from 'lucide-react';

export default function GuruDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Dashboard Guru" 
        description="Selamat datang, Anda dapat memantau kedatangan makanan dari Sekolah Anda."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-primary/10 p-4 rounded-full text-primary">
              <School size={32} />
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Status Sekolah</div>
              <div className="text-2xl font-bold text-foreground">Terhubung</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-green-100 p-4 rounded-full text-green-600">
              <CheckCircle size={32} />
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Notifikasi Baru</div>
              <div className="text-2xl font-bold text-foreground">Tersedia</div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="text-sm text-center text-muted-foreground mt-8">
        Silakan navigasi ke menu "Distribusi" untuk melihat status pengiriman MBG hari ini.
      </div>
    </div>
  );
}
