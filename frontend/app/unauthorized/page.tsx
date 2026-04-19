import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex bg-neutral-100 min-h-screen items-center justify-center p-4 text-center">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-md">
        <div className="mb-4 text-red-500">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-neutral-800 mb-2">Akses Ditolak</h1>
        <p className="text-sm text-neutral-600 mb-6">
          Anda tidak memiliki izin (role) yang sesuai untuk mengakses halaman ini.
        </p>
        <Link 
          href="/"
          className="inline-block w-full rounded-lg bg-neutral-800 p-3 text-sm font-semibold text-white transition hover:bg-neutral-900"
        >
          Kembali ke Dashboard Utama
        </Link>
      </div>
    </div>
  );
}
