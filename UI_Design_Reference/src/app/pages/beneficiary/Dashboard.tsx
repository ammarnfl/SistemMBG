import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Utensils, ClipboardList, CheckCircle, Calendar } from "lucide-react";
import { useNavigate } from "react-router";

export default function BeneficiaryDashboard() {
  const navigate = useNavigate();
  const hasSubmittedToday = false;

  const todayMenu = {
    name: "Nasi Ayam Goreng",
    date: "Senin, 20 April 2026",
    components: [
      { name: "Nasi Putih", portion: "150g" },
      { name: "Ayam Goreng", portion: "80g" },
      { name: "Tumis Kangkung", portion: "70g" },
      { name: "Pisang", portion: "100g" },
      { name: "Susu UHT", portion: "200ml" },
    ],
    nutrition: {
      calories: 620,
      protein: 33,
    }
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h2 className="text-xl mb-1">Selamat Datang!</h2>
        <p className="text-muted-foreground">Rizki Ramadhan - Kelas 1A</p>
      </div>

      {!hasSubmittedToday && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold mb-1">Isi Evaluasi Hari Ini</p>
                <p className="text-sm text-muted-foreground">
                  Yuk, kasih tahu kami pendapat kamu tentang makanan hari ini!
                </p>
              </div>
            </div>
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => navigate("/beneficiary/attendance")}
            >
              Mulai Isi Evaluasi
            </Button>
          </CardContent>
        </Card>
      )}

      {hasSubmittedToday && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Terima Kasih!</h3>
            <p className="text-sm text-muted-foreground">
              Kamu sudah mengisi evaluasi hari ini
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <Utensils className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-medium">Menu Hari Ini</h3>
              <p className="text-sm text-muted-foreground">{todayMenu.date}</p>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-200 mb-4">
            <p className="font-semibold text-lg mb-3">{todayMenu.name}</p>
            <div className="space-y-2">
              {todayMenu.components.map((component, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                  <span className="text-sm">{component.name}</span>
                  <span className="text-xs text-muted-foreground">({component.portion})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">Kalori</p>
              <p className="font-semibold">{todayMenu.nutrition.calories} kcal</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">Protein</p>
              <p className="font-semibold">{todayMenu.nutrition.protein}g</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Riwayat Evaluasi</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/beneficiary/history")}
            >
              Lihat Semua
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">19 April 2026</p>
                <p className="text-xs text-muted-foreground">Nasi Ikan Bakar</p>
              </div>
              <Badge className="bg-green-100 text-green-700">
                Terisi
              </Badge>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">18 April 2026</p>
                <p className="text-xs text-muted-foreground">Nasi Tempe Orek</p>
              </div>
              <Badge className="bg-green-100 text-green-700">
                Terisi
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
