import { useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { CheckCircle, Calendar, Star, MessageSquare, Image as ImageIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";

const historyData = [
  {
    date: "19 April 2026",
    menu: "Nasi Ikan Bakar",
    overallRating: 4.5,
    hasFeedback: true,
    hasPhoto: false,
    status: "submitted"
  },
  {
    date: "18 April 2026",
    menu: "Nasi Tempe Orek",
    overallRating: 4.0,
    hasFeedback: false,
    hasPhoto: false,
    status: "submitted"
  },
  {
    date: "17 April 2026",
    menu: "Nasi Ayam Kecap",
    overallRating: 4.8,
    hasFeedback: true,
    hasPhoto: true,
    status: "submitted"
  },
  {
    date: "16 April 2026",
    menu: "Nasi Rendang",
    overallRating: 5.0,
    hasFeedback: true,
    hasPhoto: false,
    status: "submitted"
  },
];

export default function BeneficiaryHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const justSubmitted = state.justSubmitted || false;
  const validationRequired = state.validationRequired || false;

  useEffect(() => {
    if (justSubmitted) {
      // Clear the state after showing success
      window.history.replaceState({}, document.title);
    }
  }, [justSubmitted]);

  if (justSubmitted) {
    return (
      <div className="px-4 py-6 space-y-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-8 pb-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>
              <motion.h3
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="font-semibold text-xl mb-2"
              >
                Terima Kasih!
              </motion.h3>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-muted-foreground mb-4"
              >
                {validationRequired 
                  ? "Evaluasi dan validasi kamu berhasil terkirim"
                  : "Evaluasi kamu berhasil terkirim"
                }
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button onClick={() => navigate("/beneficiary")}>
                  Kembali ke Beranda
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {validationRequired && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <p className="text-sm text-blue-900">
                  Masukan kamu sangat berharga! Tim dapur akan meninjau evaluasi kamu dan berusaha 
                  meningkatkan kualitas makanan.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h2 className="text-xl mb-1">Riwayat Evaluasi</h2>
        <p className="text-muted-foreground text-sm">Daftar evaluasi yang sudah kamu isi</p>
      </div>

      <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{historyData.length}</p>
              <p className="text-sm text-muted-foreground">Evaluasi Terkirim</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {historyData.map((item, index) => (
          <Card key={index}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3 mb-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium mb-1">{item.menu}</p>
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                </div>
                <Badge className="bg-green-100 text-green-700">
                  Terkirim
                </Badge>
              </div>

              <div className="flex items-center gap-4 pt-3 border-t border-border">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{item.overallRating}</span>
                </div>

                {item.hasFeedback && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs">Ada feedback</span>
                  </div>
                )}

                {item.hasPhoto && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-xs">Ada foto</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            Semua evaluasi kamu membantu kami menyediakan makanan yang lebih baik. 
            Terima kasih atas partisipasimu!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
