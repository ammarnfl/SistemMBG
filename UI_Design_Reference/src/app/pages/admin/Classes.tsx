import { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Plus, Search, School, Users } from "lucide-react";
import { toast } from "sonner";

const mockClasses = [
  { id: 1, name: "Kelas 1A", school: "SDN Menteng 01", students: 28, teacher: "Siti Rahayu" },
  { id: 2, name: "Kelas 1B", school: "SDN Menteng 01", students: 30, teacher: "Budi Santoso" },
  { id: 3, name: "Kelas 2A", school: "SDN Menteng 01", students: 27, teacher: "Ani Wijaya" },
  { id: 4, name: "Kelas 1A", school: "SDN Cikini 02", students: 32, teacher: "Ahmad Fauzi" },
  { id: 5, name: "Kelas 1B", school: "SDN Cikini 02", students: 29, teacher: "Dewi Lestari" },
];

export default function AdminClasses() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClasses = mockClasses.filter(cls =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.school.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl mb-1">Kelola Kelas</h2>
          <p className="text-muted-foreground text-sm">Manajemen kelas dan kelompok</p>
        </div>
        <Button size="sm" onClick={() => toast.success("Dialog tambah kelas")}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari kelas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {filteredClasses.map((cls) => (
          <Card key={cls.id}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-medium mb-2">{cls.name}</h3>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <School className="w-4 h-4" />
                      <span>{cls.school}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{cls.students} siswa</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Badge className="bg-orange-100 text-orange-700">
                      Guru: {cls.teacher}
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
