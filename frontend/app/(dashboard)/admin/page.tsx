'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Loader2, Users, UtensilsCrossed, School, LayoutGrid, ArrowRight, Link2, GraduationCap } from 'lucide-react';
import Link from 'next/link';

interface AdminStats {
  totalUser: number;
  totalDapur: number;
  totalSekolah: number;
  totalKelas: number;
  mappingDapurSekolah: number;
  mappingGuruSekolah: number;
  mappingPMSekolah: number;
  userPerRole: { ADMIN: number; TIM_DAPUR: number; GURU: number; PENERIMA_MANFAAT: number };
}

function StatCard({ icon: Icon, label, value, color, href }: {
  icon: any; label: string; value: number | string; color: string; href?: string;
}) {
  const content = (
    <Card className={`hover:shadow-md transition-all group border-l-4 ${color}`}>
      <CardContent className="p-5 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-muted/60 group-hover:bg-primary/10 transition-colors">
          <Icon size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-foreground mt-0.5">{value}</p>
        </div>
        {href && <ArrowRight size={16} className="text-muted-foreground/40 group-hover:text-primary transition-colors" />}
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/proxy/dashboard/admin')
      .then((r) => r.ok ? r.json() : Promise.reject('Gagal memuat stats'))
      .then((json) => setStats(json?.data ?? json))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  const menuItems = [
    { title: 'Manajemen User', desc: 'Kelola admin, dapur, guru, penerima manfaat', href: '/admin/users', icon: Users },
    { title: 'Manajemen Dapur', desc: 'Kelola data dapur penyedia makanan', href: '/admin/dapur', icon: UtensilsCrossed },
    { title: 'Manajemen Sekolah', desc: 'Kelola data sekolah dan mapping dapur', href: '/admin/sekolah', icon: School },
    { title: 'Manajemen Kelas', desc: 'Kelola data kelas per sekolah', href: '/admin/kelas', icon: LayoutGrid },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Dashboard Admin"
        description="Ringkasan data dan status sistem MBG secara keseluruhan."
      />

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {stats && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={Users} label="Total Pengguna" value={stats.totalUser} color="border-l-primary" href="/admin/users" />
            <StatCard icon={UtensilsCrossed} label="Total Dapur" value={stats.totalDapur} color="border-l-orange-400" href="/admin/dapur" />
            <StatCard icon={School} label="Total Sekolah" value={stats.totalSekolah} color="border-l-blue-400" href="/admin/sekolah" />
            <StatCard icon={LayoutGrid} label="Total Kelas" value={stats.totalKelas} color="border-l-purple-400" href="/admin/kelas" />
          </div>

          {/* Mapping & Role Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Link2 size={16} className="text-primary" />
                  Status Mapping
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Sekolah → Dapur', value: stats.mappingDapurSekolah, total: stats.totalSekolah },
                  { label: 'Guru → Sekolah', value: stats.mappingGuruSekolah, total: stats.userPerRole.GURU },
                  { label: 'Penerima Manfaat → Sekolah', value: stats.mappingPMSekolah, total: stats.userPerRole.PENERIMA_MANFAAT },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{m.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: m.total > 0 ? `${Math.min(100, (m.value / m.total) * 100)}%` : '0%' }}
                        />
                      </div>
                      <span className="text-xs font-medium w-12 text-right">{m.value}/{m.total}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap size={16} className="text-primary" />
                  Distribusi Pengguna per Role
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { role: 'ADMIN', label: 'Admin', color: 'bg-red-100 text-red-700' },
                  { role: 'TIM_DAPUR', label: 'Tim Dapur', color: 'bg-orange-100 text-orange-700' },
                  { role: 'GURU', label: 'Guru', color: 'bg-blue-100 text-blue-700' },
                  { role: 'PENERIMA_MANFAAT', label: 'Penerima Manfaat', color: 'bg-green-100 text-green-700' },
                ].map((r) => (
                  <div key={r.role} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
                    <Badge className={`${r.color} border-0 font-medium text-xs`}>{r.label}</Badge>
                    <span className="font-bold text-foreground">{(stats.userPerRole as any)[r.role] || 0} orang</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Quick Navigation */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Menu Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {menuItems.map((m, i) => {
            const Icon = m.icon;
            return (
              <Link href={m.href} key={i}>
                <Card className="hover:border-primary/50 hover:shadow-md transition-all h-full group cursor-pointer">
                  <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-4">
                    <div className="p-2 rounded-lg bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors mt-0.5">
                      <Icon size={20} />
                    </div>
                    <div>
                      <CardTitle className="text-sm group-hover:text-primary transition-colors">{m.title}</CardTitle>
                      <CardDescription className="text-xs mt-0.5">{m.desc}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
