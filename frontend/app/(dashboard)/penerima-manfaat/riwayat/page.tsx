'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Calendar, Star, CheckCircle2, ThumbsDown, Camera, Check } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function RiwayatEvaluasiPage() {
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const searchParams = useSearchParams();
  const showSuccess = searchParams.get('success') === '1';

  useEffect(() => {
    const fetchRiwayat = async () => {
      try {
        const res = await fetch('/api/proxy/evaluasi/riwayat');
        if (!res.ok) {
          throw new Error('Gagal memuat riwayat evaluasi');
        }
        const data = await res.json();
        setRiwayat(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRiwayat();
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
        <h1 className="text-2xl font-bold tracking-tight">Riwayat Evaluasi</h1>
        <p className="text-muted-foreground mt-1 text-sm">Daftar penilaian makanan yang pernah Anda kirim.</p>
      </div>

      {showSuccess && (
        <Alert className="bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Evaluasi berhasil dikirim! Terima kasih atas masukan Anda.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!error && riwayat.length === 0 ? (
        <Card className="border-dashed bg-muted/10 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center p-10 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground font-medium">Belum ada riwayat evaluasi</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {riwayat.map((item) => (
            <Card key={item.id} className="overflow-hidden shadow-sm">
              <div className={`h-1 w-full ${item.statusKonsumsi === 'KONSUMSI' ? 'bg-primary' : 'bg-destructive'}`} />
              <CardContent className="p-4 sm:p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {item.distribusi?.menu?.nama || 'Menu MBG'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <Badge variant={item.statusKonsumsi === 'KONSUMSI' ? 'default' : 'destructive'} className="text-[10px] font-semibold px-2">
                    {item.statusKonsumsi === 'KONSUMSI' ? 'MAKAN' : 'TIDAK MAKAN'}
                  </Badge>
                </div>

                {item.statusKonsumsi === 'KONSUMSI' && (
                  <div className="bg-muted/30 rounded-lg p-3 mt-3 flex items-center justify-between border">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Kepuasan</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={14} 
                          className={item.ratingKeseluruhan >= star ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'} 
                        />
                      ))}
                    </div>
                  </div>
                )}

                {(item.feedback || item.fotoUrl) && (
                  <div className="mt-4 pt-4 border-t border-dashed space-y-3">
                    {item.feedback && (
                      <div className="bg-muted/20 p-3 rounded-lg border text-sm italic text-muted-foreground">
                        "{item.feedback}"
                      </div>
                    )}
                    {item.fotoUrl && (
                      <div className="flex items-center gap-2 text-xs font-medium text-primary bg-primary/5 p-2 rounded-md border border-primary/10">
                        <Camera size={14} /> Foto dilampirkan
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
