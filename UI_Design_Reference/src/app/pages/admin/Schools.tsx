import { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Plus, Search, MapPin, Users } from "lucide-react";
import { toast } from "sonner";

const mockSchools = [
  { id: 1, name: "SDN Menteng 01", address: "Jl. HOS Cokroaminoto No. 12", students: 420, teachers: 18, status: "Aktif" },
  { id: 2, name: "SDN Cikini 02", address: "Jl. Cikini Raya No. 34", students: 380, teachers: 16, status: "Aktif" },
  { id: 3, name: "SDN Matraman 03", address: "Jl. Matraman No. 56", students: 450, teachers: 20, status: "Aktif" },
  { id: 4, name: "SDN Tebet 01", address: "Jl. Tebet Barat No. 78", students: 390, teachers: 17, status: "Aktif" },
];

export default function AdminSchools() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSchools = mockSchools.filter(school =>
    school.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl mb-1">Kelola Sekolah</h2>
          <p className="text-muted-foreground text-sm">Manajemen data sekolah penerima</p>
        </div>
        <Button size="sm" onClick={() => toast.success("Dialog tambah sekolah")}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari sekolah..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {filteredSchools.map((school) => (
          <Card key={school.id}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium">{school.name}</h3>
                    <Badge variant="secondary" className="text-xs">{school.status}</Badge>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{school.address}</span>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-green-600" />
                      <span className="text-muted-foreground">{school.students} siswa</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-orange-600" />
                      <span className="text-muted-foreground">{school.teachers} guru</span>
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
