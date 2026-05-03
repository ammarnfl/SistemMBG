'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Star, CheckCircle2, ArrowLeft, AlertCircle, Camera, MessageSquare } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

export default function FormEvaluasiPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawDistribusiId = searchParams.get('distribusiId');
  const rawTanggal = searchParams.get('tanggal');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [distribusi, setDistribusi] = useState<any>(null);

  // Form State
  const [statusKonsumsi, setStatusKonsumsi] = useState<'KONSUMSI' | 'TIDAK_KONSUMSI' | null>(null);
  const [ratingKeseluruhan, setRatingKeseluruhan] = useState<number>(0);
  const [penilaianKomponen, setPenilaianKomponen] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  const [fotoSourced, setFotoSourced] = useState<File | null>(null);

  useEffect(() => {
    const fetchTodayMenu = async () => {
      try {
        const dateParam = rawTanggal ? `?date=${rawTanggal}` : '';
        const res = await fetch(`/api/proxy/evaluasi/today${dateParam}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Gagal memuat menu');
        }
        const data = await res.json();
        if (!data) throw new Error('Tidak ada data distribusi hari ini');
        setDistribusi(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayMenu();
  }, [rawTanggal]);

  // Derived state for validation
  const showFeedbackSection = statusKonsumsi === 'TIDAK_KONSUMSI' || 
    (ratingKeseluruhan > 0 && ratingKeseluruhan <= 2) || 
    Object.values(penilaianKomponen).some(val => val <= 2);

  const isFormValid = () => {
    if (!statusKonsumsi) return false;
    
    if (statusKonsumsi === 'KONSUMSI') {
      if (ratingKeseluruhan === 0) return false;
      if (distribusi?.menu?.komponen?.length !== Object.keys(penilaianKomponen).length) return false;
    }

    if (showFeedbackSection && !feedback && !fotoSourced) return false;

    return true;
  };

  const handleKomponenRating = (komponenId: string, value: number) => {
    setPenilaianKomponen(prev => ({ ...prev, [komponenId]: value }));
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;
    
    setSubmitting(true);
    setError('');

    try {
      let fotoUrl = undefined;

      // 1. Upload foto if exists
      if (fotoSourced) {
        const formData = new FormData();
        formData.append('file', fotoSourced);

        const uploadRes = await fetch('/api/proxy/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Gagal mengunggah foto');
        }

        const uploadData = await uploadRes.json();
        fotoUrl = uploadData.url;
      }

      // 2. Submit Evaluasi
      const payload = {
        tanggal: distribusi.tanggal,
        distribusiId: distribusi.id,
        statusKonsumsi,
        ...(statusKonsumsi === 'KONSUMSI' && {
          ratingKeseluruhan,
          penilaianKomponen: Object.entries(penilaianKomponen).map(([id, skor]) => ({
            komponenId: id,
            skorKeterhabisan: skor,
          }))
        }),
        ...(feedback && { feedback }),
        ...(fotoUrl && { fotoUrl }),
      };

      const res = await fetch('/api/proxy/evaluasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Gagal menyimpan evaluasi');
      }

      // Success
      router.push('/penerima-manfaat/riwayat?success=1');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  if (error && !distribusi) {
    return (
      <div className="max-w-md mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pb-12">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Evaluasi Makanan</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Berikan penilaian Anda dengan jujur.</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Gagal Menyimpan</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Step 1: Presensi */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">1</span>
              Apakah Anda mengonsumsi makanan hari ini?
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <RadioGroup value={statusKonsumsi || ''} onValueChange={(val: any) => setStatusKonsumsi(val)} className="flex flex-col space-y-3">
              <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-muted/50 transition cursor-pointer" onClick={() => setStatusKonsumsi('KONSUMSI')}>
                <RadioGroupItem value="KONSUMSI" id="konsumsi" />
                <Label htmlFor="konsumsi" className="flex-1 cursor-pointer">Ya, saya makan.</Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-muted/50 transition cursor-pointer" onClick={() => setStatusKonsumsi('TIDAK_KONSUMSI')}>
                <RadioGroupItem value="TIDAK_KONSUMSI" id="tidak-konsumsi" />
                <Label htmlFor="tidak-konsumsi" className="flex-1 cursor-pointer">Tidak, saya tidak makan.</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Step 2: Rating (If KONSUMSI) */}
        {statusKonsumsi === 'KONSUMSI' && (
          <Card className="shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">2</span>
                Penilaian Kepuasan
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              {/* Overall Rating */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Secara keseluruhan, seberapa suka Anda?</Label>
                <div className="flex justify-between items-center bg-muted/30 p-4 rounded-xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingKeseluruhan(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={`${ratingKeseluruhan >= star ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'} transition-colors duration-200`}
                      />
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground px-1 uppercase tracking-wider font-medium">
                  <span>Sangat Kurang</span>
                  <span>Sangat Suka</span>
                </div>
              </div>

              <div className="border-t border-dashed my-4"></div>

              {/* Komponen Rating */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold mb-2 block">Seberapa habis porsi ini?</Label>
                {distribusi?.menu?.komponen?.map((komp: any) => (
                  <div key={komp.id} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{komp.nama}</span>
                      <span className="text-xs text-muted-foreground">{komp.porsi}</span>
                    </div>
                    <div className="flex justify-between items-center gap-1">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          onClick={() => handleKomponenRating(komp.id, val)}
                          className={`flex-1 h-8 rounded-md text-xs font-medium transition-all ${
                            penilaianKomponen[komp.id] === val 
                            ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </CardContent>
          </Card>
        )}

        {/* Step 3: Validasi Tambahan (Optional / Mandatory) */}
        {(statusKonsumsi && (showFeedbackSection || statusKonsumsi === 'KONSUMSI')) && (
          <Card className={`shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 ${showFeedbackSection ? 'border-amber-500/50 ring-1 ring-amber-500/20' : ''}`}>
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-base flex items-center gap-2">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground ${showFeedbackSection ? 'bg-amber-500' : 'bg-primary'}`}>3</span>
                Masukan & Foto {showFeedbackSection && <span className="text-amber-500 font-normal text-xs ml-auto">*Wajib salah satu</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              
              {showFeedbackSection && (
                <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300 pb-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Karena penilaian Anda rendah atau tidak makan, kami membutuhkan foto ompreng atau masukan untuk bahan evaluasi tim dapur.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <MessageSquare size={16} className="text-muted-foreground" />
                  Pesan / Masukan {showFeedbackSection ? '' : '(Opsional)'}
                </Label>
                <Textarea 
                  placeholder="Ceritakan mengapa Anda kurang suka, atau berikan saran..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="resize-none h-24"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <Camera size={16} className="text-muted-foreground" />
                  Foto Makanan/Sisa {showFeedbackSection ? '' : '(Opsional)'}
                </Label>
                <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center bg-muted/10 hover:bg-muted/30 transition-colors">
                  <input 
                    type="file" 
                    accept="image/*" 
                    id="foto-upload" 
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFotoSourced(e.target.files[0]);
                      }
                    }}
                  />
                  <Label htmlFor="foto-upload" className="cursor-pointer flex flex-col items-center">
                    {fotoSourced ? (
                      <>
                        <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                        <span className="text-sm font-medium text-foreground">{fotoSourced.name}</span>
                        <span className="text-xs text-muted-foreground mt-1 underline">Ganti Foto</span>
                      </>
                    ) : (
                      <>
                        <div className="p-3 bg-primary/10 rounded-full mb-3 text-primary">
                          <Camera className="h-6 w-6" />
                        </div>
                        <span className="text-sm font-medium">Ketuk untuk Ambil Foto</span>
                        <span className="text-xs text-muted-foreground mt-1">Bisa pakai kamera HP</span>
                      </>
                    )}
                  </Label>
                </div>
              </div>

            </CardContent>
          </Card>
        )}

        <Button 
          className="w-full h-12 text-base font-semibold shadow-md rounded-xl"
          disabled={!isFormValid() || submitting}
          onClick={handleSubmit}
        >
          {submitting ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Mengirim...</>
          ) : (
            'Kirim Evaluasi'
          )}
        </Button>

      </div>
    </div>
  );
}
