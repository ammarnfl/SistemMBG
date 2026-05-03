import { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Plus, Search, School, FolderTree } from "lucide-react";
import { toast } from "sonner";

const mockBeneficiaries = [
  { id: 1, name: "Rizki Ramadhan", nis: "2023001", school: "SDN Menteng 01", class: "1A", status: "Aktif" },
  { id: 2, name: "Aisyah Putri", nis: "2023002", school: "SDN Menteng 01", class: "1A", status: "Aktif" },
  { id: 3, name: "Farhan Maulana", nis: "2023003", school: "SDN Menteng 01", class: "1B", status: "Aktif" },
  { id: 4, name: "Sinta Dewi", nis: "2023004", school: "SDN Cikini 02", class: "1A", status: "Aktif" },
  { id: 5, name: "Arif Budiman", nis: "2023005", school: "SDN Cikini 02", class: "1A", status: "Aktif" },
];

export default function AdminBeneficiaries() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBeneficiaries = mockBeneficiaries.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.nis.includes(searchQuery)
  );

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl mb-1">Penerima Manfaat</h2>
          <p className="text-muted-foreground text-sm">Manajemen data siswa penerima</p>
        </div>
        <Button size="sm" onClick={() => toast.success("Dialog tambah penerima")}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari penerima manfaat..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {filteredBeneficiaries.map((beneficiary) => (
          <Card key={beneficiary.id}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{beneficiary.name}</h3>
                    <Badge variant="secondary" className="text-xs">{beneficiary.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">NIS: {beneficiary.nis}</p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <School className="w-4 h-4" />
                      <span>{beneficiary.school}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FolderTree className="w-4 h-4" />
                      <span>Kelas {beneficiary.class}</span>
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
