import { Outlet } from "react-router";
import MobileNav from "../components/MobileNav";
import { LayoutDashboard, ClipboardCheck, Users, FileText } from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/teacher", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Konfirmasi Pengiriman", path: "/teacher/confirmation", icon: <ClipboardCheck className="w-5 h-5" /> },
  { label: "Monitor Pengisian", path: "/teacher/monitoring", icon: <Users className="w-5 h-5" /> },
  { label: "Catatan Sekolah", path: "/teacher/notes", icon: <FileText className="w-5 h-5" /> },
];

export default function TeacherLayout() {
  return (
    <div className="min-h-screen bg-background">
      <MobileNav title="Guru" items={navItems} />
      <main className="pb-6">
        <Outlet />
      </main>
    </div>
  );
}
