import { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Plus, Search, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

const mockKitchens = [
  { id: 1, name: "Dapur Pusat Jakarta Selatan", address: "Jl. Mampang Prapatan No. 12", phone: "021-7989234", capacity: 500, status: "Aktif" },
  { id: 2, name: "Dapur Regional Jakarta Timur", address: "Jl. Matraman Raya No. 45", phone: "021-8567123", capacity: 450, status: "Aktif" },
  { id: 3, name: "Dapur Pusat Jakarta Barat", address: "Jl. Tomang Raya No. 89", phone: "021-5634789", capacity: 600, status: "Aktif" },
];

export default function AdminKitchens() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredKitchens = mockKitchens.filter(kitchen =>
    kitchen.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl mb-1">Kelola Dapur</h2>
          <p className="text-muted-foreground text-sm">Manajemen dapur produksi makanan</p>
        </div>
        <Button size="sm" onClick={() => toast.success("Dialog tambah dapur")}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari dapur..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {filteredKitchens.map((kitchen) => (
          <Card key={kitchen.id}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium">{kitchen.name}</h3>
                    <Badge variant="secondary" className="text-xs">{kitchen.status}</Badge>
                  </div>
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{kitchen.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{kitchen.phone}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Badge className="bg-green-100 text-green-700">
                      Kapasitas: {kitchen.capacity} porsi/hari
                    </Badge>
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
