import { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Plus, Calendar } from "lucide-react";
import { toast } from "sonner";

const existingNotes = [
  {
    id: 1,
    date: "19 April 2026",
    note: "Siswa sangat menyukai menu hari ini. Porsi buah diminta ditambah.",
    category: "Feedback Positif"
  },
  {
    id: 2,
    date: "18 April 2026",
    note: "Beberapa siswa mengeluh sayur terlalu matang. Mohon diperhatikan waktu memasak.",
    category: "Saran Perbaikan"
  },
  {
    id: 3,
    date: "17 April 2026",
    note: "Pengiriman terlambat 15 menit. Makanan masih hangat saat tiba.",
    category: "Pengiriman"
  },
];

export default function TeacherNotes() {
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState("");

  const handleSubmit = () => {
    if (!newNote.trim()) {
      toast.error("Mohon tulis catatan terlebih dahulu");
      return;
    }

    toast.success("Catatan berhasil ditambahkan");
    setNewNote("");
    setIsAdding(false);
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case "Feedback Positif": return "bg-green-100 text-green-700";
      case "Saran Perbaikan": return "bg-orange-100 text-orange-700";
      case "Pengiriman": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl mb-1">Catatan Sekolah</h2>
          <p className="text-muted-foreground text-sm">Tambahkan catatan atau masukan</p>
        </div>
        {!isAdding && (
          <Button size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="border-blue-200">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-note">Tulis Catatan</Label>
                <Textarea
                  id="new-note"
                  placeholder="Contoh: Siswa sangat menyukai menu hari ini, atau ada saran perbaikan..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={5}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => {
                  setIsAdding(false);
                  setNewNote("");
                }}>
                  Batal
                </Button>
                <Button className="flex-1" onClick={handleSubmit}>
                  Simpan Catatan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h3 className="font-medium mb-3">Riwayat Catatan</h3>
        <div className="space-y-3">
          {existingNotes.map((item) => (
            <Card key={item.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{item.date}</span>
                </div>
                <p className="text-sm mb-3">{item.note}</p>
                <Badge className={getCategoryColor(item.category)}>
                  {item.category}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <p className="text-sm text-green-900">
            <strong>Tips:</strong> Catatan Anda membantu tim dapur meningkatkan kualitas makanan dan layanan.
            Silakan berbagi feedback, saran, atau masalah yang ditemukan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
