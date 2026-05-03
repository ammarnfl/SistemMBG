import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { FileBarChart, Download, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const weeklyDistribution = [
  { day: "Sen", distributed: 3240, consumed: 3180 },
  { day: "Sel", distributed: 3240, consumed: 3150 },
  { day: "Rab", distributed: 3240, consumed: 3200 },
  { day: "Kam", distributed: 3240, consumed: 3210 },
  { day: "Jum", distributed: 3240, consumed: 3190 },
];

const ratingDistribution = [
  { rating: "5 Bintang", count: 1420, color: "#16a34a" },
  { rating: "4 Bintang", count: 980, color: "#84cc16" },
  { rating: "3 Bintang", count: 320, color: "#eab308" },
  { rating: "2 Bintang", count: 95, color: "#f97316" },
  { rating: "1 Bintang", count: 30, color: "#dc2626" },
];

export default function KitchenReports() {
  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl mb-1">Laporan</h2>
          <p className="text-muted-foreground text-sm">Analisis dan ringkasan evaluasi</p>
        </div>
        <Button size="sm">
          <Download className="w-4 h-4 mr-2" />
          Ekspor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Periode Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">14 Apr - 20 Apr 2026</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Minggu Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-2xl font-semibold text-green-700">16,200</p>
              <p className="text-sm text-muted-foreground">Total Distribusi</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-2xl font-semibold text-blue-700">98.1%</p>
              <p className="text-sm text-muted-foreground">Tingkat Konsumsi</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-2xl font-semibold text-purple-700">4.6</p>
              <p className="text-sm text-muted-foreground">Rating Rata-rata</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-2xl font-semibold text-orange-700">89.5%</p>
              <p className="text-sm text-muted-foreground">Partisipasi</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribusi vs Konsumsi</CardTitle>
          <CardDescription>Perbandingan porsi didistribusi dan dikonsumsi</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="distributed" fill="#16a34a" name="Distribusi" radius={[4, 4, 0, 0]} />
              <Bar dataKey="consumed" fill="#3b82f6" name="Konsumsi" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribusi Rating</CardTitle>
          <CardDescription>Sebaran rating dari penerima manfaat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ratingDistribution.map((item) => (
              <div key={item.rating} className="flex items-center gap-3">
                <div className="w-24 text-sm">{item.rating}</div>
                <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                  <div
                    className="h-full flex items-center px-3 text-white text-sm font-medium"
                    style={{
                      width: `${(item.count / 2845) * 100}%`,
                      backgroundColor: item.color,
                      minWidth: "40px"
                    }}
                  >
                    {item.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <FileBarChart className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-green-900">Performa Baik</p>
              <p className="text-sm text-green-700 mt-1">
                Rating dan tingkat konsumsi minggu ini menunjukkan peningkatan dibanding minggu lalu.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
