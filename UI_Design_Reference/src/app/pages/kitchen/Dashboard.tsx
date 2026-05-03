import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Utensils, Truck, CheckCircle, AlertTriangle, TrendingUp, Star } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const statsData = [
  { label: "Menu Hari Ini", value: "Nasi Ayam", icon: Utensils, color: "text-green-600", bgColor: "bg-green-50" },
  { label: "Distribusi Hari Ini", value: "3,240", icon: Truck, color: "text-blue-600", bgColor: "bg-blue-50" },
  { label: "Konfirmasi Diterima", value: "42/45", icon: CheckCircle, color: "text-purple-600", bgColor: "bg-purple-50" },
  { label: "Perlu Perhatian", value: "8", icon: AlertTriangle, color: "text-orange-600", bgColor: "bg-orange-50" },
];

const ratingTrend = [
  { date: "15 Apr", rating: 4.2 },
  { date: "16 Apr", rating: 4.5 },
  { date: "17 Apr", rating: 4.3 },
  { date: "18 Apr", rating: 4.6 },
  { date: "19 Apr", rating: 4.4 },
  { date: "20 Apr", rating: 4.7 },
];

const todayMenuComponents = [
  { name: "Nasi Putih", portion: "150g", avgRating: 4.8 },
  { name: "Ayam Goreng", portion: "80g", avgRating: 4.6 },
  { name: "Tumis Kangkung", portion: "70g", avgRating: 4.2 },
  { name: "Pisang", portion: "100g", avgRating: 4.9 },
  { name: "Susu UHT", portion: "200ml", avgRating: 4.7 },
];

const pendingConfirmations = [
  { school: "SDN Menteng 01", time: "2 menit lalu", status: "pending" },
  { school: "SDN Kebayoran 02", time: "15 menit lalu", status: "pending" },
  { school: "SDN Tebet 05", time: "23 menit lalu", status: "pending" },
];

export default function KitchenDashboard() {
  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h2 className="text-xl mb-1">Dashboard Dapur</h2>
        <p className="text-muted-foreground">Senin, 20 April 2026</p>
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
          <CardTitle>Tren Rating 7 Hari Terakhir</CardTitle>
          <CardDescription>Rating rata-rata makanan per hari</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={ratingTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis domain={[0, 5]} fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="rating" stroke="#16a34a" strokeWidth={2} dot={{ fill: "#16a34a" }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Komposisi Menu Hari Ini</CardTitle>
          <CardDescription>Rating per komponen makanan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todayMenuComponents.map((component) => (
              <div key={component.name} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{component.name}</p>
                  <p className="text-xs text-muted-foreground">{component.portion}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-sm">{component.avgRating}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Menunggu Konfirmasi</CardTitle>
          <CardDescription>Sekolah yang belum konfirmasi penerimaan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingConfirmations.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.school}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
                <Badge className="bg-orange-100 text-orange-700 border-orange-300">
                  Pending
                </Badge>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            Lihat Semua Konfirmasi
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
