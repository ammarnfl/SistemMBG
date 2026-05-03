import { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { CheckCircle, Package, Users, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function TeacherConfirmation() {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [hasIssue, setHasIssue] = useState(false);
  const [notes, setNotes] = useState("");

  const deliveryInfo = {
    date: "Senin, 20 April 2026",
    time: "08:15",
    menu: "Nasi Ayam Goreng",
    portions: 28,
    driver: "Agus S.",
    kitchen: "Dapur Pusat Jakarta Selatan"
  };

  const handleConfirm = () => {
    if (hasIssue && !notes.trim()) {
      toast.error("Mohon jelaskan masalah yang ditemukan");
      return;
    }

    setIsConfirmed(true);
    toast.success(hasIssue ? "Konfirmasi dengan catatan masalah terkirim" : "Penerimaan berhasil dikonfirmasi");
  };

  if (isConfirmed) {
    return (
      <div className="px-4 py-6 space-y-6">
        <div>
          <h2 className="text-xl mb-1">Konfirmasi Pengiriman</h2>
          <p className="text-muted-foreground text-sm">Status konfirmasi penerimaan makanan</p>
        </div>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6 pb-6 text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Konfirmasi Berhasil</h3>
            <p className="text-sm text-muted-foreground">
              Penerimaan makanan telah dikonfirmasi pada {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4">Detail Konfirmasi</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Menu:</span>
                <span className="font-medium">{deliveryInfo.menu}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Porsi:</span>
                <span className="font-medium">{deliveryInfo.portions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Waktu terima:</span>
                <span className="font-medium">{deliveryInfo.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge className={hasIssue ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}>
                  {hasIssue ? "Diterima (Ada Catatan)" : "Diterima"}
                </Badge>
              </div>
              {hasIssue && notes && (
                <div className="pt-3 border-t">
                  <p className="text-muted-foreground mb-1">Catatan masalah:</p>
                  <p className="font-medium">{notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h2 className="text-xl mb-1">Konfirmasi Pengiriman</h2>
        <p className="text-muted-foreground text-sm">Konfirmasi penerimaan makanan dari dapur</p>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold mb-1">Pengiriman Tiba</p>
              <p className="text-sm text-muted-foreground">
                Makanan dari {deliveryInfo.kitchen} telah tiba
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-4">Detail Pengiriman</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{deliveryInfo.menu}</p>
                <p className="text-sm text-muted-foreground">{deliveryInfo.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Jumlah porsi</p>
                <p className="font-medium">{deliveryInfo.portions} porsi</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setHasIssue(!hasIssue)}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span className="font-medium">Ada masalah dengan pengiriman?</span>
              </div>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                hasIssue ? "bg-orange-600 border-orange-600" : "border-muted-foreground"
              }`}>
                {hasIssue && <CheckCircle className="w-4 h-4 text-white" />}
              </div>
            </div>

            {hasIssue && (
              <div className="space-y-2">
                <Label htmlFor="notes">Jelaskan masalah yang ditemukan</Label>
                <Textarea
                  id="notes"
                  placeholder="Contoh: Beberapa kemasan rusak, makanan kurang lengkap, dll"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button 
          className="w-full" 
          size="lg"
          onClick={handleConfirm}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Konfirmasi Penerimaan
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Dengan mengkonfirmasi, Anda menyatakan makanan telah diterima
        </p>
      </div>
    </div>
  );
}
