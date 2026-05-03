'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Loader2, Utensils, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/FormComponents';

export default function BerandaPenerimaManfaat() {
  const [distribusi, setDistribusi] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchTodayMenu = async () => {
      try {
        const res = await fetch('/api/proxy/evaluasi/today');
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Gagal memuat menu hari ini');
        }
        const json = await res.json();
        const actualData = json?.data !== undefined ? json.data : json;
        setDistribusi(actualData ? actualData : null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayMenu();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Menu Hari Ini</h1>
        <p className="text-muted-foreground mt-1">Cek makanan yang dibagikan hari ini.</p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : !distribusi ? (
        <Card className="border-dashed shadow-sm">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground space-y-4">
            <div className="p-4 bg-muted/50 rounded-full">
              <Utensils className="h-8 w-8 text-muted-foreground/70" />
            </div>
            <div>
              <p className="font-medium text-foreground">Belum ada makanan</p>
              <p className="text-sm mt-1">Tidak ada distribusi makanan untuk sekolah Anda hari ini.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-md border-primary/20 overflow-hidden relative">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50" />
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-primary">{distribusi.menu.nama}</CardTitle>
            <CardDescription className="flex justify-between items-center mt-2">
              <span>Dapur: {distribusi.dapur.nama}</span>
              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                {new Date(distribusi.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{distribusi.menu.deskripsi || 'Tidak ada deskripsi menu.'}</p>
            
            <div className="space-y-3 mt-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Komponen Menu</h4>
              <div className="grid gap-2">
                {distribusi.menu.komponen.map((komp: any) => (
                  <div key={komp.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border border-border/50">
                    <div>
                      <p className="font-medium text-sm">{komp.nama}</p>
                      {komp.deskripsi && <p className="text-xs text-muted-foreground mt-0.5">{komp.deskripsi}</p>}
                    </div>
                    {komp.porsi && <span className="text-xs font-medium px-2 py-1 bg-background rounded-md border shadow-sm">{komp.porsi}</span>}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-4 bg-muted/10 border-t">
            <Button 
              className="w-full font-medium shadow-sm h-11" 
              onClick={() => router.push(`/penerima-manfaat/evaluasi?distribusiId=${distribusi.id}&tanggal=${distribusi.tanggal}`)}
            >
              Isi Evaluasi Makanan
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
