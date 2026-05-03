import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { School, Users, CheckCircle, Clock, Truck } from "lucide-react";
import { toast } from "sonner";

const distributions = [
  { id: 1, school: "SDN Menteng 01", portions: 420, status: "confirmed", time: "07:30", driver: "Agus S." },
  { id: 2, school: "SDN Cikini 02", portions: 380, status: "confirmed", time: "07:45", driver: "Budi R." },
  { id: 3, school: "SDN Matraman 03", portions: 450, status: "pending", time: "08:00", driver: "Cahyo W." },
  { id: 4, school: "SDN Tebet 01", portions: 390, status: "pending", time: "08:15", driver: "Dedi M." },
  { id: 5, school: "SDN Kebayoran 02", portions: 360, status: "in-transit", time: "07:50", driver: "Eko P." },
];

export default function KitchenDistribution() {
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-700">Dikonfirmasi</Badge>;
      case "in-transit":
        return <Badge className="bg-blue-100 text-blue-700">Dalam Perjalanan</Badge>;
      case "pending":
        return <Badge className="bg-orange-100 text-orange-700">Menunggu</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h2 className="text-xl mb-1">Distribusi Makanan</h2>
        <p className="text-muted-foreground text-sm">Senin, 20 April 2026</p>
      </div>

      <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-semibold">3,240</p>
              <p className="text-sm text-muted-foreground">Total Porsi Hari Ini</p>
            </div>
          </div>
          <div className="flex gap-4 text-sm mt-4 pt-4 border-t border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>2 dikonfirmasi</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span>3 pending</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {distributions.map((dist) => (
          <Card key={dist.id}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <School className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium mb-1">{dist.school}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Users className="w-4 h-4" />
                    <span>{dist.portions} porsi</span>
                  </div>
                  {getStatusBadge(dist.status)}
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="text-sm">
                  <p className="text-muted-foreground">Waktu kirim: {dist.time}</p>
                  <p className="text-muted-foreground">Pengantar: {dist.driver}</p>
                </div>
                {dist.status === "pending" && (
                  <Button size="sm" onClick={() => toast.success(`Distribusi ke ${dist.school} dimulai`)}>
                    Mulai Kirim
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
