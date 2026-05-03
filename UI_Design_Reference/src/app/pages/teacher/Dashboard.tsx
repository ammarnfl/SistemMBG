import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { CheckCircle, Users, AlertCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router";

export default function TeacherDashboard() {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h2 className="text-xl mb-1">Dashboard Guru</h2>
        <p className="text-muted-foreground">Senin, 20 April 2026</p>
      </div>

      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold mb-1">Konfirmasi Penerimaan Diperlukan</p>
              <p className="text-sm text-muted-foreground">Makanan telah tiba, mohon konfirmasi penerimaan</p>
            </div>
          </div>
          <Button 
            className="w-full"
            onClick={() => navigate("/teacher/confirmation")}
          >
            Konfirmasi Sekarang
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-semibold mb-1">28</p>
            <p className="text-sm text-muted-foreground">Total Siswa</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-semibold mb-1">24</p>
            <p className="text-sm text-muted-foreground">Sudah Mengisi</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-medium mb-1">Status Pengisian Evaluasi</h3>
              <p className="text-sm text-muted-foreground">Kelas 1A - SDN Menteng 01</p>
            </div>
            <Badge className="bg-blue-100 text-blue-700">
              85.7%
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Sudah mengisi</span>
              </div>
              <span className="font-semibold">24 siswa</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium">Belum mengisi</span>
              </div>
              <span className="font-semibold">4 siswa</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={() => navigate("/teacher/monitoring")}
          >
            Lihat Detail
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-3">Menu Hari Ini</h3>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="font-medium mb-2">Nasi Ayam Goreng</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>• Nasi Putih (150g)</p>
              <p>• Ayam Goreng (80g)</p>
              <p>• Tumis Kangkung (70g)</p>
              <p>• Pisang (100g)</p>
              <p>• Susu UHT (200ml)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-green-900">Informasi</p>
              <p className="text-sm text-green-700 mt-1">
                Pastikan semua siswa mengisi evaluasi sebelum pukul 14:00
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
