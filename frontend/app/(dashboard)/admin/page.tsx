export default function AdminDashboardPage() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100">
        <h2 className="text-xl font-bold text-neutral-800">Dashboard Admin</h2>
        <p className="text-sm text-neutral-500 mt-1">Selamat datang, Administrator.</p>
      </div>

      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
        <p className="text-sm text-blue-800">
          Fitur manajemen user dan struktur master akan diimplementasikan pada Tahap 2.
        </p>
      </div>
    </div>
  );
}
