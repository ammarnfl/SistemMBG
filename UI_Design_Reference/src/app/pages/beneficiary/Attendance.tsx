import { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function BeneficiaryAttendance() {
  const navigate = useNavigate();
  const [consumed, setConsumed] = useState<boolean | null>(null);

  const handleNext = () => {
    if (consumed === null) {
      toast.error("Mohon pilih salah satu");
      return;
    }

    if (consumed) {
      navigate("/beneficiary/rating");
    } else {
      // If not consumed, validation will be required
      navigate("/beneficiary/feedback", { state: { validationRequired: true, reason: "Makanan tidak dikonsumsi" } });
    }
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl">Kehadiran Makan</h2>
          <span className="text-sm text-muted-foreground">Langkah 1/5</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-green-600" style={{ width: "20%" }} />
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Label className="text-base mb-4 block">
            Apakah kamu makan makanan yang disediakan hari ini?
          </Label>

          <div className="space-y-3">
            <div
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                consumed === true
                  ? "border-green-600 bg-green-50"
                  : "border-border hover:border-green-300"
              }`}
              onClick={() => setConsumed(true)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    consumed === true
                      ? "bg-green-600 border-green-600"
                      : "border-muted-foreground"
                  }`}>
                    {consumed === true && <CheckCircle className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                    <p className="font-medium">Ya, saya makan</p>
                    <p className="text-sm text-muted-foreground">Lanjutkan ke penilaian</p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                consumed === false
                  ? "border-orange-600 bg-orange-50"
                  : "border-border hover:border-orange-300"
              }`}
              onClick={() => setConsumed(false)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    consumed === false
                      ? "bg-orange-600 border-orange-600"
                      : "border-muted-foreground"
                  }`}>
                    {consumed === false && <CheckCircle className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                    <p className="font-medium">Tidak, saya tidak makan</p>
                    <p className="text-sm text-muted-foreground">Mohon beri alasan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>Informasi:</strong> Jawaban kamu membantu kami menyediakan makanan yang lebih baik.
            Mohon jawab dengan jujur ya!
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button 
          className="w-full" 
          size="lg"
          onClick={handleNext}
          disabled={consumed === null}
        >
          Lanjutkan
        </Button>
        <Button 
          variant="outline"
          className="w-full"
          onClick={() => navigate("/beneficiary")}
        >
          Kembali
        </Button>
      </div>
    </div>
  );
}
