import { Outlet } from "react-router";
import MobileNav from "../components/MobileNav";
import { LayoutDashboard, ClipboardList, History } from "lucide-react";

const navItems = [
  { label: "Menu Hari Ini", path: "/beneficiary", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Isi Evaluasi", path: "/beneficiary/attendance", icon: <ClipboardList className="w-5 h-5" /> },
  { label: "Riwayat", path: "/beneficiary/history", icon: <History className="w-5 h-5" /> },
];

export default function BeneficiaryLayout() {
  return (
    <div className="min-h-screen bg-background">
      <MobileNav title="Penerima Manfaat" items={navItems} />
      <main className="pb-6">
        <Outlet />
      </main>
    </div>
  );
}
