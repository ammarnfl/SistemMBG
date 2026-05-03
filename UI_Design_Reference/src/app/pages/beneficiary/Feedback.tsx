import { useState, useRef } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Camera, Upload, AlertCircle, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { toast } from "sonner";

export default function BeneficiaryFeedback() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const validationRequired = state.validationRequired || false;
  const validationReasons = state.validationReasons || [];

  const [feedback, setFeedback] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
        toast.success("Foto berhasil diunggah");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    // Validation logic
    if (validationRequired) {
      if (!feedback.trim()) {
        toast.error("Mohon berikan alasan untuk membantu kami");
        return;
      }
      if (!photo) {
        toast.error("Mohon upload foto makanan sebagai bukti");
        return;
      }
    }

    // Save all data and navigate to success page
    const submissionData = {
      overallRating: state.overallRating,
      componentRatings: state.componentRatings,
      feedback: feedback.trim() || null,
      hasPhoto: !!photo,
      validationRequired,
      timestamp: new Date().toISOString(),
    };

    console.log("Submission data:", submissionData);
    
    navigate("/beneficiary/history", { 
      state: { 
        justSubmitted: true,
        validationRequired 
      } 
    });
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl">Umpan Balik & Foto</h2>
          <span className="text-sm text-muted-foreground">Langkah 4/5</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-green-600" style={{ width: "80%" }} />
        </div>
      </div>

      {validationRequired && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-orange-900 mb-2">Validasi Diperlukan</p>
                <p className="text-sm text-orange-900 mb-2">
                  Berdasarkan penilaian kamu, mohon berikan alasan dan foto makanan:
                </p>
                <ul className="text-sm text-orange-900 space-y-1">
                  {validationReasons.map((reason, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-orange-600">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2 mb-4">
            <Label htmlFor="feedback">
              Umpan Balik {validationRequired && <span className="text-destructive">*</span>}
            </Label>
            <p className="text-sm text-muted-foreground">
              {validationRequired 
                ? "Mohon jelaskan mengapa kamu memberi rating rendah atau tidak menghabiskan makanan"
                : "Opsional - Kasih tahu kami pendapat kamu (boleh dikosongkan)"
              }
            </p>
          </div>
          <Textarea
            id="feedback"
            placeholder={validationRequired 
              ? "Contoh: Sayurnya kurang segar, ayamnya terlalu asin, dll"
              : "Contoh: Enak sekali! Saya suka ayamnya renyah"
            }
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            className={validationRequired && !feedback.trim() ? "border-orange-300" : ""}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2 mb-4">
            <Label>
              Foto Makanan {validationRequired && <span className="text-destructive">*</span>}
            </Label>
            <p className="text-sm text-muted-foreground">
              {validationRequired 
                ? "Mohon upload foto makanan sebagai bukti validasi"
                : "Opsional - Upload foto makanan kamu (boleh dikosongkan)"
              }
            </p>
          </div>

          {!photo ? (
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-32 border-dashed"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-2">
                  <Camera className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm font-medium">Ambil Foto</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload dari Galeri
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>
          ) : (
            <div className="relative">
              <img 
                src={photo} 
                alt="Uploaded food" 
                className="w-full h-64 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => {
                  setPhoto(null);
                  toast.info("Foto dihapus");
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {!validationRequired && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <p className="text-sm text-green-900">
              Umpan balik dan foto bersifat opsional, tapi sangat membantu kami meningkatkan kualitas makanan untuk kamu!
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <Button 
          className="w-full" 
          size="lg"
          onClick={handleNext}
          disabled={validationRequired && (!feedback.trim() || !photo)}
        >
          {validationRequired ? "Kirim Validasi" : "Lanjutkan"}
        </Button>
        <Button 
          variant="outline"
          className="w-full"
          onClick={() => navigate("/beneficiary/component-rating")}
        >
          Kembali
        </Button>
      </div>
    </div>
  );
}
