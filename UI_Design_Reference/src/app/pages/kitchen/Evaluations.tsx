import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Star, TrendingUp, TrendingDown } from "lucide-react";

const overallStats = {
  avgRating: 4.5,
  totalResponses: 2845,
  participationRate: 87.8,
};

const componentRatings = [
  { name: "Nasi Putih", avgRating: 4.8, avgConsumption: 4.9, responses: 2845 },
  { name: "Ayam Goreng", avgRating: 4.6, avgConsumption: 4.7, responses: 2845 },
  { name: "Tumis Kangkung", avgRating: 4.2, avgConsumption: 3.8, responses: 2845 },
  { name: "Pisang", avgRating: 4.9, avgConsumption: 4.8, responses: 2845 },
  { name: "Susu UHT", avgRating: 4.7, avgConsumption: 4.9, responses: 2845 },
];

const schoolComparison = [
  { school: "SDN Menteng 01", avgRating: 4.7, responses: 398, participation: 94.8 },
  { school: "SDN Cikini 02", avgRating: 4.5, responses: 356, participation: 93.7 },
  { school: "SDN Matraman 03", avgRating: 4.3, responses: 402, participation: 89.3 },
  { school: "SDN Tebet 01", avgRating: 4.6, responses: 368, participation: 94.4 },
];

export default function KitchenEvaluations() {
  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h2 className="text-xl mb-1">Evaluasi Makanan</h2>
        <p className="text-muted-foreground text-sm">Rating dan konsumsi dari penerima manfaat</p>
      </div>

      <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center">
              <Star className="w-8 h-8 text-white fill-white" />
            </div>
            <div>
              <p className="text-3xl font-semibold">{overallStats.avgRating}</p>
              <p className="text-sm text-muted-foreground">Rating Keseluruhan</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Total Respon</p>
              <p className="font-semibold">{overallStats.totalResponses.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Partisipasi</p>
              <p className="font-semibold">{overallStats.participationRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rating per Komponen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {componentRatings.map((component) => (
              <div key={component.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{component.name}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{component.avgRating}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Kepuasan</span>
                    <span>{component.avgRating}/5</span>
                  </div>
                  <Progress value={(component.avgRating / 5) * 100} className="h-2" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Konsumsi</span>
                    <span>{component.avgConsumption}/5</span>
                  </div>
                  <Progress value={(component.avgConsumption / 5) * 100} className="h-2 [&>div]:bg-blue-500" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Perbandingan per Sekolah</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {schoolComparison.map((school) => (
              <div key={school.school} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{school.school}</p>
                    <p className="text-xs text-muted-foreground">{school.responses} respon</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{school.avgRating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={school.participation} className="flex-1 h-1.5" />
                  <span className="text-xs text-muted-foreground">{school.participation}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
