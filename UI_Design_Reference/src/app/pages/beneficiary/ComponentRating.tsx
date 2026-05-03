import { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Star, AlertCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { toast } from "sonner";

const menuComponents = [
  { id: 1, name: "Nasi Putih", portion: "150g" },
  { id: 2, name: "Ayam Goreng", portion: "80g" },
  { id: 3, name: "Tumis Kangkung", portion: "70g" },
  { id: 4, name: "Pisang", portion: "100g" },
  { id: 5, name: "Susu UHT", portion: "200ml" },
];

const consumptionDescriptions = [
  { value: 1, label: "Hampir tidak dimakan" },
  { value: 2, label: "Dimakan sedikit" },
  { value: 3, label: "Dimakan setengah" },
  { value: 4, label: "Dimakan banyak" },
  { value: 5, label: "Habis semua" },
];

export default function BeneficiaryComponentRating() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const overallRating = state.overallRating || 0;
  const needsValidation = state.needsValidation || false;

  const [ratings, setRatings] = useState<{ [key: number]: number }>({});

  const handleRatingChange = (componentId: number, value: number) => {
    setRatings({ ...ratings, [componentId]: value });
  };

  const handleNext = () => {
    if (Object.keys(ratings).length < menuComponents.length) {
      toast.error("Mohon beri rating untuk semua komponen makanan");
      return;
    }

    // Check if any component has low rating
    const hasLowComponentRating = Object.values(ratings).some(r => r <= 2);
    
    // Determine if validation is needed
    const validationRequired = needsValidation || hasLowComponentRating;
    const validationReasons = [];
    
    if (needsValidation) {
      validationReasons.push(state.validationReason || "Rating keseluruhan rendah");
    }
    if (hasLowComponentRating) {
      validationReasons.push("Ada komponen dengan konsumsi rendah");
    }

    if (validationRequired) {
      navigate("/beneficiary/feedback", {
        state: {
          overallRating,
          componentRatings: ratings,
          validationRequired: true,
          validationReasons: validationReasons,
        }
      });
    } else {
      navigate("/beneficiary/feedback", {
        state: {
          overallRating,
          componentRatings: ratings,
          validationRequired: false,
        }
      });
    }
  };

  const allRated = Object.keys(ratings).length === menuComponents.length;
  const hasLowRating = Object.values(ratings).some(r => r <= 2);

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl">Rating per Komponen</h2>
          <span className="text-sm text-muted-foreground">Langkah 3/5</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-green-600" style={{ width: "60%" }} />
        </div>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>Rating Konsumsi:</strong> Seberapa banyak kamu makan setiap komponen makanan ini?
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {menuComponents.map((component) => {
          const currentRating = ratings[component.id] || 0;
          const description = consumptionDescriptions.find(d => d.value === currentRating);

          return (
            <Card key={component.id} className={currentRating > 0 && currentRating <= 2 ? "border-orange-200" : ""}>
              <CardContent className="pt-4 pb-4">
                <div className="mb-3">
                  <Label className="text-base">{component.name}</Label>
                  <p className="text-sm text-muted-foreground">{component.portion}</p>
                </div>

                <div className="flex justify-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      className="focus:outline-none transition-transform hover:scale-110"
                      onClick={() => handleRatingChange(component.id, value)}
                    >
                      <Star
                        className={`w-9 h-9 transition-colors ${
                          value <= currentRating
                            ? "fill-blue-500 text-blue-500"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {description && (
                  <p className="text-center text-sm font-medium">{description.label}</p>
                )}

                {currentRating > 0 && currentRating <= 2 && (
                  <div className="mt-3 p-2 bg-orange-100 border border-orange-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-orange-900">
                      Kamu akan diminta memberi alasan di langkah berikutnya
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {allRated && hasLowRating && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-orange-900">
                Ada komponen dengan konsumsi rendah. Di langkah selanjutnya, kami akan meminta kamu untuk 
                memberikan alasan dan foto untuk membantu kami memahami masalahnya.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <Button 
          className="w-full" 
          size="lg"
          onClick={handleNext}
          disabled={!allRated}
        >
          Lanjutkan
        </Button>
        <Button 
          variant="outline"
          className="w-full"
          onClick={() => navigate("/beneficiary/rating")}
        >
          Kembali
        </Button>
      </div>
    </div>
  );
}
