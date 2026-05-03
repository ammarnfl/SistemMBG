'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { ShieldCheck } from 'lucide-react';

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
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
      <Card className="w-full max-w-md shadow-lg border-none sm:border-solid sm:border-border">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck size={32} className="text-primary" />
          </div>
          <CardTitle className="text-2xl text-foreground">Sistem MBG</CardTitle>
          <CardDescription>Evaluasi Layanan Makan Bergizi Gratis</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="masukkan email anda"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="pt-2">
              <Button type="submit" disabled={loading} className="w-full h-12 text-sm font-bold">
                {loading ? 'Memproses...' : 'Masuk'}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col border-t pt-6 bg-secondary/30 mt-2 rounded-b-xl">
          <div className="w-full text-xs text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">Akses Akun Demo:</p>
            <div className="grid grid-cols-2 gap-2">
              <Badge variant="outline" className="justify-center py-1">admin@example.com</Badge>
              <Badge variant="outline" className="justify-center py-1">dapur@example.com</Badge>
              <Badge variant="outline" className="justify-center py-1">guru@example.com</Badge>
              <Badge variant="outline" className="justify-center py-1">pm@example.com</Badge>
            </div>
            <p className="pt-2 text-center">Password: <span className="font-mono bg-background px-1.5 py-0.5 rounded border">Password123!</span></p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
