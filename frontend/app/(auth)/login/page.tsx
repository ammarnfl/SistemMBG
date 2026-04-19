'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || 'Login gagal.');
        setLoading(false);
        return;
      }

      // Next.js middleware will redirect us to the correct dashboard based on cookie
      router.push('/');
      router.refresh();
    } catch (err) {
      setError('Terjadi kesalahan koneksi.');
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-neutral-100 min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-md">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-neutral-800">Sistem MBG</h1>
          <p className="text-sm text-neutral-500">Evaluasi Layanan Makan Bergizi</p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="admin@example.com"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 p-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div className="mt-6 border-t pt-4 text-xs text-neutral-400">
          <p>Petunjuk dummy login:</p>
          <ul className="mt-1 list-inside list-disc">
            <li>admin@example.com</li>
            <li>dapur@example.com</li>
            <li>guru@example.com</li>
            <li>pm@example.com</li>
          </ul>
          <p className="mt-1">Pass: Password123!</p>
        </div>
      </div>
    </div>
  );
}
