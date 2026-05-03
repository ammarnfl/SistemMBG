import { Outlet } from "react-router";
import MobileNav from "../components/MobileNav";
import { LayoutDashboard, Users, ChefHat, School, FolderTree, UserCheck, Network } from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Pengguna", path: "/admin/users", icon: <Users className="w-5 h-5" /> },
  { label: "Dapur", path: "/admin/kitchens", icon: <ChefHat className="w-5 h-5" /> },
  { label: "Sekolah", path: "/admin/schools", icon: <School className="w-5 h-5" /> },
  { label: "Kelas", path: "/admin/classes", icon: <FolderTree className="w-5 h-5" /> },
  { label: "Penerima Manfaat", path: "/admin/beneficiaries", icon: <UserCheck className="w-5 h-5" /> },
  { label: "Pemetaan", path: "/admin/mapping", icon: <Network className="w-5 h-5" /> },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <MobileNav title="Admin" items={navItems} />
      <main className="pb-6">
        <Outlet />
      </main>
    </div>
  );
}
