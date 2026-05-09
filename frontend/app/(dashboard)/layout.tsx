'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '../../components/layout/DashboardShell';
import { Home, Users, School, UtensilsCrossed, LayoutGrid, BookOpen, CalendarDays, Truck, ClipboardList, Loader2, WifiOff } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/proxy/auth/me');
      if (!res.ok) {
        // Token invalid or expired, redirect to login
        router.push('/login');
        return;
      }
      const json = await res.json();
      const userData = json?.data || json;
      setRole(userData?.role || null);
    } catch (e) {
      // Network/connection error (backend down)
      setError('Tidak dapat terhubung ke server. Pastikan backend berjalan di port 3001.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      // Use window.location.href for a hard redirect to ensure all state is cleared
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed:', err);
      // Fallback redirect
      window.location.href = '/login';
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-4 max-w-md">
          <WifiOff className="mx-auto text-muted-foreground" size={48} />
          <h2 className="text-xl font-bold text-foreground">Koneksi Gagal</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={fetchMe}
              className="w-full px-6 py-2 rounded-md bg-primary text-white font-medium hover:bg-primary/90 transition"
            >
              Coba Lagi
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-6 py-2 rounded-md bg-secondary text-foreground font-medium hover:bg-secondary/80 transition"
            >
              Keluar ke Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  let navItems: any[] = [];
  let userRoleLabel = 'User';

  if (role === 'ADMIN') {
    userRoleLabel = 'Admin';
    navItems = [
      { title: 'Dashboard', href: '/admin', icon: Home },
      { title: 'Pengguna', href: '/admin/users', icon: Users },
      { title: 'Dapur', href: '/admin/dapur', icon: UtensilsCrossed },
      { title: 'Sekolah', href: '/admin/sekolah', icon: School },
      { title: 'Kelas/Grup', href: '/admin/kelas', icon: LayoutGrid },
      { title: 'Laporan', href: '/laporan', icon: ClipboardList },
    ];
  } else if (role === 'TIM_DAPUR') {
    userRoleLabel = 'Tim Dapur';
    navItems = [
      { title: 'Dashboard', href: '/dapur', icon: Home },
      { title: 'Menu Master', href: '/dapur/menu', icon: BookOpen },
      { title: 'Jadwal Aktif', href: '/dapur/jadwal', icon: CalendarDays },
      { title: 'Distribusi', href: '/dapur/distribusi', icon: Truck },
      { title: 'Laporan', href: '/laporan', icon: ClipboardList },
    ];
  } else if (role === 'GURU') {
    userRoleLabel = 'Guru';
    navItems = [
      { title: 'Dashboard', href: '/guru', icon: Home },
      { title: 'Distribusi', href: '/guru/distribusi', icon: Truck },
      { title: 'Laporan', href: '/laporan', icon: ClipboardList },
    ];
  } else if (role === 'PENERIMA_MANFAAT') {
    userRoleLabel = 'Penerima Manfaat';
    navItems = [
      { title: 'Beranda', href: '/penerima-manfaat', icon: Home },
      { title: 'Riwayat', href: '/penerima-manfaat/riwayat', icon: BookOpen },
    ];
  }

  return (
    <DashboardShell navItems={navItems} userRole={userRoleLabel} onLogout={handleLogout}>
      {children}
    </DashboardShell>
  );
}

