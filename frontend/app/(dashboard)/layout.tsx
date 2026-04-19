'use client';

import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="bg-white px-4 py-3 shadow-sm flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-bold text-neutral-800">MBG App</h1>
        <button 
          onClick={handleLogout}
          className="text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 py-1.5 px-3 rounded-md transition"
        >
          Keluar
        </button>
      </header>
      <main className="flex-1 overflow-y-auto p-4 max-w-md mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
