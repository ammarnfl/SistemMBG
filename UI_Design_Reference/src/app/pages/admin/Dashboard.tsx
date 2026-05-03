import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Users, ChefHat, School, UserCheck, TrendingUp, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const statsData = [
  { label: "Total Pengguna", value: "148", icon: Users, color: "text-blue-600", bgColor: "bg-blue-50" },
  { label: "Dapur Aktif", value: "12", icon: ChefHat, color: "text-green-600", bgColor: "bg-green-50" },
  { label: "Sekolah", value: "45", icon: School, color: "text-purple-600", bgColor: "bg-purple-50" },
  { label: "Penerima Manfaat", value: "3,240", icon: UserCheck, color: "text-orange-600", bgColor: "bg-orange-50" },
];

const distributionData = [
  { month: "Nov", meals: 82000 },
  { month: "Dec", meals: 89000 },
  { month: "Jan", meals: 95000 },
  { month: "Feb", meals: 92000 },
  { month: "Mar", meals: 98000 },
  { month: "Apr", meals: 96000 },
];

const roleDistribution = [
  { name: "Penerima Manfaat", value: 3240, color: "#16a34a" },
  { name: "Guru", value: 85, color: "#f97316" },
  { name: "Tim Dapur", value: 48, color: "#3b82f6" },
  { name: "Admin", value: 12, color: "#8b5cf6" },
];

const recentActivities = [
  { action: "Pengguna baru ditambahkan", user: "Ahmad Fauzi (Guru)", time: "5 menit lalu", status: "success" },
  { action: "Dapur baru terdaftar", user: "Dapur Pusat Jakarta Selatan", time: "1 jam lalu", status: "success" },
  { action: "Mapping diperbarui", user: "3 sekolah dipetakan ke Dapur Pusat", time: "2 jam lalu", status: "info" },
  { action: "Data siswa diimpor", user: "120 penerima manfaat ditambahkan", time: "3 jam lalu", status: "success" },
];

export default function AdminDashboard() {
  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h2 className="text-xl mb-1">Dashboard Admin</h2>
        <p className="text-muted-foreground">Gambaran umum sistem evaluasi layanan MBG</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {statsData.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-semibold mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribusi Makanan 6 Bulan Terakhir</CardTitle>
          <CardDescription>Total porsi yang didistribusikan per bulan</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="meals" fill="#16a34a" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribusi Pengguna per Peran</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={roleDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {roleDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
          <CardDescription>Perubahan dan update sistem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  activity.status === "success" ? "bg-green-500" :
                  activity.status === "info" ? "bg-blue-500" : "bg-gray-400"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.user}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-orange-900">Perhatian: Pembaruan Data</p>
              <p className="text-sm text-orange-700 mt-1">
                Pastikan data master selalu diperbarui untuk akurasi laporan dan evaluasi.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
