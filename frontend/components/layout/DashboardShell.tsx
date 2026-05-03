'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

interface DashboardShellProps {
  children: React.ReactNode;
  navItems: NavItem[];
  userRole?: string;
  onLogout: () => void;
}

export function DashboardShell({ children, navItems, userRole = 'Admin', onLogout }: DashboardShellProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isLinkActive = (href: string) => {
    if (href === '/admin' || href === '/dapur' || href === '/guru' || href === '/penerima-manfaat') {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  const navContent = (
    <>
      <nav className="space-y-1 px-3 flex-1">
        {navItems.map((item) => {
          const active = isLinkActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setDrawerOpen(false)}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Icon size={18} />
              {item.title}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pt-2 border-t mt-2">
        <div className="px-3 py-2 text-xs font-medium text-muted-foreground mb-1">
          Login sebagai: {userRole}
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground pb-16 md:pb-0">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-white px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setDrawerOpen((o) => !o)} className="md:hidden text-foreground">
            {drawerOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-lg font-bold tracking-tight text-primary">Sistem MBG</h1>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">{userRole}</span>
          <button onClick={onLogout} className="flex items-center gap-2 text-sm font-medium text-destructive hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors">
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </header>

      {/* Drawer overlay for mobile */}
      {drawerOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 md:hidden" 
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <div className="flex flex-1">
        {/* Desktop Sidebar - always visible on md+ */}
        <aside className="hidden md:flex w-64 flex-col bg-white border-r py-4 shrink-0">
          {navContent}
        </aside>

        {/* Mobile Drawer - slides from left */}
        {drawerOpen && (
          <aside className="fixed inset-y-0 left-0 top-14 z-20 w-64 flex flex-col bg-white border-r py-4 md:hidden animate-in slide-in-from-left duration-200">
            {navContent}
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto w-full p-4 md:p-6 bg-background">
          <div className="mx-auto max-w-4xl">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex h-16 justify-around border-t bg-white pb-[env(safe-area-inset-bottom)] px-2">
        {navItems.slice(0, 5).map((item) => {
          const active = isLinkActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full min-w-[3.5rem] rounded-lg transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className={`p-1 rounded-full ${active ? 'bg-primary/10' : ''}`}>
                <Icon size={20} />
              </div>
              <span className="mt-1 text-[10px] font-medium leading-none truncate max-w-[60px] tracking-tight text-center">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
