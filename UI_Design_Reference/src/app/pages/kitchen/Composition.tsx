import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Plus, Edit } from "lucide-react";
import { toast } from "sonner";

const menuCompositions = [
  {
    menuName: "Nasi Ayam Goreng",
    date: "Senin, 20 Apr",
    components: [
      { name: "Nasi Putih", portion: "150g", calories: 195, protein: 4 },
      { name: "Ayam Goreng", portion: "80g", calories: 180, protein: 18 },
      { name: "Tumis Kangkung", portion: "70g", calories: 35, protein: 3 },
      { name: "Pisang", portion: "100g", calories: 90, protein: 1 },
      { name: "Susu UHT", portion: "200ml", calories: 120, protein: 7 },
    ],
    totalCalories: 620,
    totalProtein: 33,
  },
];

export default function KitchenComposition() {
  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl mb-1">Komposisi Menu</h2>
          <p className="text-muted-foreground text-sm">Detail komponen setiap menu</p>
        </div>
        <Button size="sm" onClick={() => toast.success("Dialog tambah komposisi")}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah
        </Button>
      </div>

      {menuCompositions.map((menu, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{menu.menuName}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{menu.date}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => toast.info("Edit komposisi")}>
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              {menu.components.map((component, idx) => (
                <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium">{component.name}</p>
                      <p className="text-sm text-muted-foreground">{component.portion}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Kalori: </span>
                      <span className="font-medium">{component.calories} kcal</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Protein: </span>
                      <span className="font-medium">{component.protein}g</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Kalori:</span>
                <span className="font-semibold">{menu.totalCalories} kcal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Protein:</span>
                <span className="font-semibold">{menu.totalProtein}g</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <Badge className="bg-green-100 text-green-700 mb-2">
                Memenuhi Standar Gizi
              </Badge>
              <p className="text-sm text-muted-foreground">
                Menu ini memenuhi kebutuhan gizi 30% AKG untuk anak usia 6-12 tahun
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
