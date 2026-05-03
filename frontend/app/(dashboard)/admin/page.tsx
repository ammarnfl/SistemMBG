import Link from 'next/link';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Users, UtensilsCrossed, School, LayoutGrid } from 'lucide-react';

export default function AdminDashboardPage() {
  const menu = [
    { title: 'Manajemen User', desc: 'Kelola admin, dapur, guru, penerima manfaat', href: '/admin/users', icon: Users },
    { title: 'Manajemen Dapur', desc: 'Kelola data dapur penyedia makanan', href: '/admin/dapur', icon: UtensilsCrossed },
    { title: 'Manajemen Sekolah', desc: 'Kelola data sekolah dan mapping dapur', href: '/admin/sekolah', icon: School },
    { title: 'Manajemen Kelas', desc: 'Kelola data kelas per sekolah', href: '/admin/kelas', icon: LayoutGrid },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Dashboard Admin" 
        description="Selamat datang di panel kontrol utama Sistem Evaluasi Layanan MBG. Pilih menu di bawah atau melalui navigasi untuk mengelola data." 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {menu.map((m, i) => {
          const Icon = m.icon;
          return (
            <Link href={m.href} key={i}>
              <Card className="hover:border-primary/50 hover:shadow-md transition-all h-full group cursor-pointer">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                  <div className="p-2 rounded-lg bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Icon size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">{m.title}</CardTitle>
                    <CardDescription className="mt-1">{m.desc}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  );
}
