import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { School, Clock, CheckCircle, XCircle } from "lucide-react";

const confirmations = [
  { id: 1, school: "SDN Menteng 01", teacher: "Siti Rahayu", time: "08:15", status: "confirmed", note: "Semua diterima dengan baik" },
  { id: 2, school: "SDN Cikini 02", teacher: "Ahmad Fauzi", time: "08:20", status: "confirmed", note: null },
  { id: 3, school: "SDN Matraman 03", teacher: "Dewi Lestari", time: "-", status: "pending", note: null },
  { id: 4, school: "SDN Tebet 01", teacher: "Budi Santoso", time: "-", status: "pending", note: null },
  { id: 5, school: "SDN Kebayoran 02", teacher: "Ani Wijaya", time: "08:25", status: "issue", note: "Beberapa kemasan rusak saat pengiriman" },
];

export default function KitchenConfirmations() {
  const getStatusInfo = (status: string) => {
    switch(status) {
      case "confirmed":
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          badge: <Badge className="bg-green-100 text-green-700">Dikonfirmasi</Badge>
        };
      case "pending":
        return {
          icon: <Clock className="w-5 h-5 text-orange-600" />,
          badge: <Badge className="bg-orange-100 text-orange-700">Pending</Badge>
        };
      case "issue":
        return {
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          badge: <Badge className="bg-red-100 text-red-700">Ada Masalah</Badge>
        };
      default:
        return {
          icon: <Clock className="w-5 h-5" />,
          badge: <Badge>Unknown</Badge>
        };
    }
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h2 className="text-xl mb-1">Konfirmasi Sekolah</h2>
        <p className="text-muted-foreground text-sm">Status konfirmasi penerimaan dari sekolah</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-semibold text-green-600">2</p>
            <p className="text-xs text-muted-foreground mt-1">Dikonfirmasi</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-semibold text-orange-600">2</p>
            <p className="text-xs text-muted-foreground mt-1">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-semibold text-red-600">1</p>
            <p className="text-xs text-muted-foreground mt-1">Masalah</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {confirmations.map((conf) => {
          const statusInfo = getStatusInfo(conf.status);
          return (
            <Card key={conf.id} className={conf.status === "issue" ? "border-red-200 bg-red-50/30" : ""}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    {statusInfo.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{conf.school}</h3>
                      {statusInfo.badge}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Guru: {conf.teacher}</p>
                    {conf.time !== "-" && (
                      <p className="text-xs text-muted-foreground">Dikonfirmasi: {conf.time}</p>
                    )}
                    {conf.note && (
                      <div className={`mt-3 p-3 rounded-lg ${
                        conf.status === "issue" ? "bg-red-100 border border-red-200" : "bg-muted/50"
                      }`}>
                        <p className="text-sm">{conf.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
