import { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Plus, Calendar, Star } from "lucide-react";
import { toast } from "sonner";

const mockMenus = [
  { id: 1, date: "Senin, 20 Apr", name: "Nasi Ayam Goreng", rating: 4.7, distributed: true },
  { id: 2, date: "Selasa, 21 Apr", name: "Nasi Ikan Bakar", rating: 4.5, distributed: false },
  { id: 3, date: "Rabu, 22 Apr", name: "Nasi Tempe Orek", rating: 4.3, distributed: false },
  { id: 4, date: "Kamis, 23 Apr", name: "Nasi Rendang", rating: 4.8, distributed: false },
  { id: 5, date: "Jumat, 24 Apr", name: "Nasi Goreng Spesial", rating: 4.6, distributed: false },
];

export default function KitchenMenus() {
  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl mb-1">Menu Makanan</h2>
          <p className="text-muted-foreground text-sm">Perencanaan menu mingguan</p>
        </div>
        <Button size="sm" onClick={() => toast.success("Dialog tambah menu")}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah
        </Button>
      </div>

      <div className="space-y-3">
        {mockMenus.map((menu) => (
          <Card key={menu.id} className={menu.distributed ? "border-green-200 bg-green-50/30" : ""}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{menu.date}</span>
                  </div>
                  <h3 className="font-medium mb-3">{menu.name}</h3>
                  <div className="flex items-center gap-3">
                    {menu.distributed && (
                      <Badge className="bg-green-100 text-green-700">
                        Sudah Distribusi
                      </Badge>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{menu.rating}</span>
                      <span className="text-xs text-muted-foreground">rata-rata</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
