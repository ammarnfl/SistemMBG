import { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Star } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const ratingDescriptions = [
  { value: 1, label: "Sangat Tidak Suka", emoji: "😢" },
  { value: 2, label: "Tidak Suka", emoji: "😕" },
  { value: 3, label: "Biasa Saja", emoji: "😐" },
  { value: 4, label: "Suka", emoji: "🙂" },
  { value: 5, label: "Sangat Suka", emoji: "😊" },
];

export default function BeneficiaryRating() {
  const navigate = useNavigate();
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const handleNext = () => {
    if (rating === null) {
      toast.error("Mohon pilih rating terlebih dahulu");
      return;
    }

    // If rating is low (1-2), validation will be required
    if (rating <= 2) {
      navigate("/beneficiary/component-rating", { 
        state: { 
          overallRating: rating, 
          needsValidation: true,
          validationReason: "Rating keseluruhan rendah"
        } 
      });
    } else {
      navigate("/beneficiary/component-rating", { state: { overallRating: rating } });
    }
  };

  const currentRating = hoveredRating || rating || 0;
  const description = ratingDescriptions.find(r => r.value === currentRating);

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl">Rating Keseluruhan</h2>
          <span className="text-sm text-muted-foreground">Langkah 2/5</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-green-600" style={{ width: "40%" }} />
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Label className="text-base mb-4 block">
            Secara keseluruhan, bagaimana pendapat kamu tentang makanan hari ini?
          </Label>

          <div className="py-8">
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  className="focus:outline-none transition-transform hover:scale-110"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(null)}
                >
                  <Star
                    className={`w-12 h-12 transition-colors ${
                      value <= currentRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            {description && (
              <div className="text-center">
                <div className="text-4xl mb-2">{description.emoji}</div>
                <p className="font-medium text-lg">{description.label}</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Rating Kepuasan:</strong> Seberapa suka kamu dengan makanan ini?
            </p>
          </div>
        </CardContent>
      </Card>

      {rating && rating <= 2 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <p className="text-sm text-orange-900">
              Terima kasih atas penilaianmu. Di langkah selanjutnya, kami akan meminta kamu untuk memberikan 
              alasan dan foto untuk membantu kami meningkatkan kualitas makanan.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <Button 
          className="w-full" 
          size="lg"
          onClick={handleNext}
          disabled={rating === null}
        >
          Lanjutkan
        </Button>
        <Button 
          variant="outline"
          className="w-full"
          onClick={() => navigate("/beneficiary/attendance")}
        >
          Kembali
        </Button>
      </div>
    </div>
  );
}
