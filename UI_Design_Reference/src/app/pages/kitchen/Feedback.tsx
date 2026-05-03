import { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { AlertTriangle, MessageSquare, Image as ImageIcon, Star } from "lucide-react";

const feedbackData = [
  {
    id: 1,
    student: "Rizki Ramadhan",
    school: "SDN Menteng 01",
    class: "1A",
    date: "20 Apr, 09:30",
    overallRating: 2,
    feedback: "Sayurnya tidak segar, kurang enak",
    hasPhoto: true,
    validationReason: "Rating rendah",
    status: "pending"
  },
  {
    id: 2,
    student: "Aisyah Putri",
    school: "SDN Menteng 01",
    class: "1A",
    date: "20 Apr, 09:32",
    overallRating: 5,
    feedback: "Enak sekali! Ayamnya renyah",
    hasPhoto: true,
    validationReason: null,
    status: "normal"
  },
  {
    id: 3,
    student: "Farhan Maulana",
    school: "SDN Cikini 02",
    class: "1B",
    date: "20 Apr, 09:35",
    overallRating: 3,
    feedback: "Porsi sayur terlalu sedikit",
    hasPhoto: false,
    validationReason: "Rating sedang",
    status: "pending"
  },
  {
    id: 4,
    student: "Sinta Dewi",
    school: "SDN Cikini 02",
    class: "1A",
    date: "20 Apr, 09:38",
    overallRating: 1,
    feedback: "Tidak dimakan, makanan dingin",
    hasPhoto: true,
    validationReason: "Tidak dikonsumsi",
    status: "issue"
  },
];

export default function KitchenFeedback() {
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);

  const pendingFeedback = feedbackData.filter(f => f.status === "pending" || f.status === "issue");
  const allFeedback = feedbackData;

  const getStatusBadge = (status: string, overallRating: number) => {
    if (status === "issue" || overallRating <= 2) {
      return <Badge className="bg-red-100 text-red-700">Perlu Perhatian</Badge>;
    }
    if (status === "pending") {
      return <Badge className="bg-orange-100 text-orange-700">Validasi</Badge>;
    }
    return <Badge className="bg-green-100 text-green-700">Normal</Badge>;
  };

  const FeedbackCard = ({ item }: { item: any }) => (
    <Card 
      key={item.id}
      className={item.status === "issue" ? "border-red-200 bg-red-50/30" : ""}
    >
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-3">
          {item.validationReason && (
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium">{item.student}</h3>
              {getStatusBadge(item.status, item.overallRating)}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {item.school} - Kelas {item.class}
            </p>

            <div className="flex items-center gap-1.5 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= item.overallRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="text-sm ml-1">{item.overallRating}/5</span>
            </div>

            {item.validationReason && (
              <div className="mb-3 p-2 bg-orange-100 border border-orange-200 rounded-lg">
                <p className="text-xs font-medium text-orange-900">
                  Alasan validasi: {item.validationReason}
                </p>
              </div>
            )}

            {item.feedback && (
              <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg mb-3">
                <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-sm flex-1">{item.feedback}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{item.date}</p>
              {item.hasPhoto && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedFeedback(item);
                    setPhotoDialogOpen(true);
                  }}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Lihat Foto
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h2 className="text-xl mb-1">Umpan Balik & Foto</h2>
        <p className="text-muted-foreground text-sm">Review feedback dan foto validasi</p>
      </div>

      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm">
                {pendingFeedback.length} feedback memerlukan validasi
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Rating rendah atau anomali terdeteksi
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">
            Perlu Validasi ({pendingFeedback.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            Semua ({allFeedback.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-3">
          {pendingFeedback.map((item) => (
            <FeedbackCard key={item.id} item={item} />
          ))}
        </TabsContent>

        <TabsContent value="all" className="mt-4 space-y-3">
          {allFeedback.map((item) => (
            <FeedbackCard key={item.id} item={item} />
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Foto Validasi</DialogTitle>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div>
                <p className="font-medium">{selectedFeedback.student}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedFeedback.school} - {selectedFeedback.date}
                </p>
              </div>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-muted-foreground" />
              </div>
              <p className="text-sm">{selectedFeedback.feedback}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
