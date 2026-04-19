import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sistem Evaluasi Layanan MBG',
  description: 'Sistem evaluasi layanan Makan Bergizi Gratis (MBG)',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} min-h-screen bg-neutral-50 text-neutral-900 mx-auto max-w-md antialiased md:max-w-full shadow-xl`}>
        <main className="min-h-screen bg-white">
          {children}
        </main>
      </body>
    </html>
  );
}
