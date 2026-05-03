import { Outlet } from "react-router";
import MobileNav from "../components/MobileNav";
import { LayoutDashboard, UtensilsCrossed, ListChecks, Truck, CheckCircle, Star, MessageSquare, FileBarChart } from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/kitchen", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Menu", path: "/kitchen/menus", icon: <UtensilsCrossed className="w-5 h-5" /> },
  { label: "Komposisi Menu", path: "/kitchen/composition", icon: <ListChecks className="w-5 h-5" /> },
  { label: "Distribusi", path: "/kitchen/distribution", icon: <Truck className="w-5 h-5" /> },
  { label: "Konfirmasi Sekolah", path: "/kitchen/confirmations", icon: <CheckCircle className="w-5 h-5" /> },
  { label: "Evaluasi Makanan", path: "/kitchen/evaluations", icon: <Star className="w-5 h-5" /> },
  { label: "Umpan Balik & Foto", path: "/kitchen/feedback", icon: <MessageSquare className="w-5 h-5" /> },
  { label: "Laporan", path: "/kitchen/reports", icon: <FileBarChart className="w-5 h-5" /> },
];

export default function KitchenLayout() {
  return (
    <div className="min-h-screen bg-background">
      <MobileNav title="Tim Dapur" items={navItems} />
      <main className="pb-6">
        <Outlet />
      </main>
    </div>
  );
}
