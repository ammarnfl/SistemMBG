export default function GuruDashboardPage() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100">
        <h2 className="text-xl font-bold text-neutral-800">Dashboard Guru</h2>
        <p className="text-sm text-neutral-500 mt-1">Selamat datang, Bapak/Ibu Guru.</p>
      </div>

      <div className="bg-green-50 p-4 rounded-xl border border-green-100">
        <p className="text-sm text-green-800">
          Fitur konfirmasi distribusi akan hadir di Tahap 3, serta monitoring evaluasi di Tahap 4.
        </p>
      </div>
    </div>
  );
}
