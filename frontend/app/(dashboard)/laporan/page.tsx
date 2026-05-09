'use client';

import { useState } from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Download, Loader2, FileText, CheckCircle2 } from 'lucide-react';

interface ReportItem {
  id: string;
  title: string;
  desc: string;
  endpoint: string;
  filename: string;
  roles: string[];
}

const REPORTS: ReportItem[] = [
  {
    id: 'distribusi',
    title: 'Laporan Distribusi',
    desc: 'Data semua distribusi makanan beserta status dan catatan pengiriman.',
    endpoint: '/api/proxy/laporan/distribusi',
    filename: 'laporan-distribusi.csv',
    roles: ['ADMIN', 'TIM_DAPUR'],
  },
  {
    id: 'evaluasi',
    title: 'Laporan Evaluasi Konsumsi',
    desc: 'Data evaluasi harian penerima manfaat: status konsumsi, rating, dan feedback.',
    endpoint: '/api/proxy/laporan/evaluasi',
    filename: 'laporan-evaluasi.csv',
    roles: ['ADMIN', 'TIM_DAPUR', 'GURU'],
  },
  {
    id: 'komponen',
    title: 'Laporan Keterhabisan Komponen',
    desc: 'Skor keterhabisan per komponen menu dari setiap evaluasi.',
    endpoint: '/api/proxy/laporan/komponen',
    filename: 'laporan-komponen.csv',
    roles: ['ADMIN', 'TIM_DAPUR'],
  },
  {
    id: 'feedback',
    title: 'Laporan Feedback',
    desc: 'Kumpulan feedback teks dan foto dari penerima manfaat.',
    endpoint: '/api/proxy/laporan/feedback',
    filename: 'laporan-feedback.csv',
    roles: ['ADMIN', 'TIM_DAPUR', 'GURU'],
  },
];

export default function LaporanPage() {
  const [tanggalAwal, setTanggalAwal] = useState('');
  const [tanggalAkhir, setTanggalAkhir] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<string[]>([]);

  const downloadCsv = async (report: ReportItem) => {
    setDownloading(report.id);
    try {
      const params = new URLSearchParams();
      if (tanggalAwal) params.set('tanggalAwal', tanggalAwal);
      if (tanggalAkhir) params.set('tanggalAkhir', tanggalAkhir);
      const qs = params.toString() ? `?${params.toString()}` : '';

      const res = await fetch(`${report.endpoint}${qs}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = report.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloaded((prev) => [...prev, report.id]);
      setTimeout(() => setDownloaded((prev) => prev.filter((id) => id !== report.id)), 3000);
    } catch (err) {
      console.error('Download error:', err);
      alert('Gagal mengunduh laporan. Pastikan Anda memiliki akses.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Laporan & Ekspor Data"
        description="Unduh laporan dalam format CSV untuk analisis lebih lanjut."
      />

      {/* Filter Tanggal */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filter Periode</CardTitle>
          <CardDescription>Opsional: batasi data laporan berdasarkan rentang tanggal.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Dari Tanggal</label>
              <input
                type="date"
                value={tanggalAwal}
                onChange={(e) => setTanggalAwal(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Sampai Tanggal</label>
              <input
                type="date"
                value={tanggalAkhir}
                onChange={(e) => setTanggalAkhir(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => { setTanggalAwal(''); setTanggalAkhir(''); }}
              className="h-10"
            >
              Reset Filter
            </Button>
          </div>
          {(tanggalAwal || tanggalAkhir) && (
            <p className="text-xs text-primary mt-2 font-medium">
              Filter aktif: {tanggalAwal || '—'} sampai {tanggalAkhir || '—'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Report Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {REPORTS.map((report) => {
          const isDownloading = downloading === report.id;
          const isDone = downloaded.includes(report.id);
          return (
            <Card key={report.id} className="hover:shadow-md transition-all group">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary mt-0.5">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm">{report.title}</CardTitle>
                    <CardDescription className="text-xs mt-1 line-clamp-2">{report.desc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  onClick={() => downloadCsv(report)}
                  disabled={!!downloading}
                  className={`w-full gap-2 h-10 text-sm transition-all ${isDone ? 'bg-green-600 hover:bg-green-700' : ''}`}
                >
                  {isDownloading ? (
                    <><Loader2 size={14} className="animate-spin" /> Mengunduh...</>
                  ) : isDone ? (
                    <><CheckCircle2 size={14} /> Berhasil Diunduh</>
                  ) : (
                    <><Download size={14} /> Unduh CSV</>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Format: CSV · {report.filename}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="p-4 bg-muted/50 rounded-xl border border-border/50 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">💡 Tips penggunaan</p>
        <ul className="space-y-1 list-disc list-inside text-xs">
          <li>File CSV bisa dibuka dengan Microsoft Excel, Google Sheets, atau LibreOffice Calc.</li>
          <li>File menggunakan encoding UTF-8 dengan BOM agar karakter Indonesia tampil dengan benar di Excel.</li>
          <li>Gunakan filter periode untuk membatasi jumlah data yang diunduh.</li>
        </ul>
      </div>
    </div>
  );
}
