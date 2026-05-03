import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { ChefHat, School, ArrowRight, Edit } from "lucide-react";
import { toast } from "sonner";

const mockMappings = [
  {
    id: 1,
    kitchen: { name: "Dapur Pusat Jakarta Selatan", capacity: 500 },
    schools: [
      { name: "SDN Menteng 01", students: 420 },
      { name: "SDN Cikini 02", students: 380 },
    ]
  },
  {
    id: 2,
    kitchen: { name: "Dapur Regional Jakarta Timur", capacity: 450 },
    schools: [
      { name: "SDN Matraman 03", students: 450 },
    ]
  },
  {
    id: 3,
    kitchen: { name: "Dapur Pusat Jakarta Barat", capacity: 600 },
    schools: [
      { name: "SDN Tebet 01", students: 390 },
      { name: "SDN Kebayoran 02", students: 360 },
    ]
  },
];

export default function AdminMapping() {
  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h2 className="text-xl mb-1">Pemetaan Dapur-Sekolah</h2>
        <p className="text-muted-foreground text-sm">Manajemen pemetaan distribusi dari dapur ke sekolah</p>
      </div>

      <div className="space-y-4">
        {mockMappings.map((mapping) => {
          const totalStudents = mapping.schools.reduce((sum, school) => sum + school.students, 0);
          const utilizationPercent = Math.round((totalStudents / mapping.kitchen.capacity) * 100);
          
          return (
            <Card key={mapping.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <ChefHat className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium mb-1">{mapping.kitchen.name}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-blue-100 text-blue-700">
                        Kapasitas: {mapping.kitchen.capacity} porsi
                      </Badge>
                      <Badge className={`${
                        utilizationPercent > 90 ? "bg-red-100 text-red-700" : 
                        utilizationPercent > 75 ? "bg-orange-100 text-orange-700" : 
                        "bg-green-100 text-green-700"
                      }`}>
                        Utilisasi: {utilizationPercent}%
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => toast.info("Edit pemetaan")}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-border" />
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="space-y-2">
                  {mapping.schools.map((school, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <School className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{school.name}</p>
                        <p className="text-xs text-muted-foreground">{school.students} siswa</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Distribusi:</span>
                    <span className="font-medium">{totalStudents} porsi/hari</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
