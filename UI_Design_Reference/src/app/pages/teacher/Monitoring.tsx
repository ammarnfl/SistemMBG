import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { CheckCircle, Clock, Star } from "lucide-react";

const students = [
  { id: 1, name: "Rizki Ramadhan", nis: "2023001", submitted: true, rating: 4.5, time: "09:30" },
  { id: 2, name: "Aisyah Putri", nis: "2023002", submitted: true, rating: 5.0, time: "09:32" },
  { id: 3, name: "Farhan Maulana", nis: "2023003", submitted: true, rating: 4.2, time: "09:35" },
  { id: 4, name: "Sinta Dewi", nis: "2023004", submitted: false, rating: null, time: null },
  { id: 5, name: "Arif Budiman", nis: "2023005", submitted: true, rating: 4.8, time: "09:40" },
  { id: 6, name: "Putri Wijaya", nis: "2023006", submitted: true, rating: 4.6, time: "09:42" },
  { id: 7, name: "Dani Pratama", nis: "2023007", submitted: false, rating: null, time: null },
  { id: 8, name: "Maya Sari", nis: "2023008", submitted: true, rating: 4.9, time: "09:45" },
];

export default function TeacherMonitoring() {
  const submittedCount = students.filter(s => s.submitted).length;
  const participationRate = (submittedCount / students.length) * 100;

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h2 className="text-xl mb-1">Monitor Pengisian</h2>
        <p className="text-muted-foreground text-sm">Status pengisian evaluasi siswa</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Tingkat Partisipasi</p>
              <p className="text-2xl font-semibold">{participationRate.toFixed(1)}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Sudah Mengisi</p>
              <p className="text-2xl font-semibold">{submittedCount}/{students.length}</p>
            </div>
          </div>
          <Progress value={participationRate} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium">Sudah Mengisi</span>
            </div>
            <p className="text-3xl font-semibold">{submittedCount}</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="font-medium">Belum Mengisi</span>
            </div>
            <p className="text-3xl font-semibold">{students.length - submittedCount}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="font-medium mb-3">Daftar Siswa</h3>
        <div className="space-y-3">
          {students.map((student) => (
            <Card key={student.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{student.name}</h4>
                      {student.submitted ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Sudah
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-700">
                          <Clock className="w-3 h-3 mr-1" />
                          Belum
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">NIS: {student.nis}</p>
                    {student.submitted && student.rating && (
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{student.rating}</span>
                        </div>
                        <span className="text-muted-foreground">Waktu: {student.time}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
