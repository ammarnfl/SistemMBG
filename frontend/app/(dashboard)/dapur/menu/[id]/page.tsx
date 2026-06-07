'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import { Badge } from '../../../../../components/ui/Badge';
import { ArrowLeft, Loader2, UtensilsCrossed, Leaf, Flame, Activity, Droplets, Info } from 'lucide-react';
import { resolveImgUrl } from '../../../../../lib/image-url';

export default function DetailMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [menu, setMenu] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/proxy/menu/${id}`);
      if (res.ok) {
        const json = await res.json();
        setMenu(json?.data || json);
      }
    } catch(e) {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p>Memuat detail menu...</p>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <UtensilsCrossed size={48} className="mb-4 opacity-50" />
        <p>Menu tidak ditemukan.</p>
        <Link href="/dapur/menu" className="mt-4">
          <Button variant="outline">Kembali ke Daftar Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Nav */}
      <div className="flex items-center gap-3">
        <Link href="/dapur/menu">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/60">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Detail Menu Master</span>
      </div>

      <div className="bg-card border border-border/40 shadow-sm rounded-3xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Photo */}
        <div className="w-full md:w-2/5 lg:w-1/2 bg-muted/30 relative">
          {menu.fotoUrl ? (
            <div className="aspect-square md:aspect-auto md:h-full relative group">
              <img
                src={resolveImgUrl(menu.fotoUrl)}
                alt={menu.nama}
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ) : (
            <div className="aspect-square md:aspect-auto md:h-full flex flex-col items-center justify-center text-muted-foreground/50 border-b md:border-b-0 md:border-r border-border/40 p-12">
              <UtensilsCrossed size={64} className="mb-4" />
              <p className="text-sm font-medium">Belum Ada Foto</p>
            </div>
          )}
        </div>

        {/* Right Side: Content */}
        <div className="w-full md:w-3/5 lg:w-1/2 p-6 md:p-8 flex flex-col">
          
          <div className="mb-6">
            <h1 className="text-3xl font-black text-foreground tracking-tight mb-2">{menu.nama}</h1>
            {menu.deskripsi ? (
              <p className="text-foreground/80 leading-relaxed text-sm">{menu.deskripsi}</p>
            ) : (
              <p className="text-muted-foreground/60 italic text-sm">Tidak ada deskripsi untuk menu ini.</p>
            )}
          </div>

          {/* Nilai Gizi section */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Activity size={14} /> Nilai Gizi per Porsi
            </h3>
            
            {(menu.energiKkal !== null || menu.proteinGram !== null) ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {menu.energiKkal !== null && (
                  <div className="bg-background border border-border/60 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-sm">
                    <Flame size={18} className="text-primary/70 mb-1" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Energi</span>
                    <div className="text-base font-black text-foreground">{menu.energiKkal} <span className="text-[10px] font-bold text-muted-foreground">kkal</span></div>
                  </div>
                )}
                {menu.proteinGram !== null && (
                  <div className="bg-background border border-border/60 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-sm">
                    <Droplets size={18} className="text-primary/70 mb-1" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Protein</span>
                    <div className="text-base font-black text-foreground">{menu.proteinGram} <span className="text-[10px] font-bold text-muted-foreground">g</span></div>
                  </div>
                )}
                {menu.lemakGram !== null && (
                  <div className="bg-background border border-border/60 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-sm">
                    <Activity size={18} className="text-primary/70 mb-1" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Lemak</span>
                    <div className="text-base font-black text-foreground">{menu.lemakGram} <span className="text-[10px] font-bold text-muted-foreground">g</span></div>
                  </div>
                )}
                {menu.karbohidratGram !== null && (
                  <div className="bg-background border border-border/60 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-sm">
                    <Leaf size={18} className="text-primary/70 mb-1" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Karbohidrat</span>
                    <div className="text-base font-black text-foreground">{menu.karbohidratGram} <span className="text-[10px] font-bold text-muted-foreground">g</span></div>
                  </div>
                )}
                {menu.seratGram !== null && (
                  <div className="bg-background border border-border/60 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-sm">
                    <Leaf size={18} className="text-primary/70 mb-1 opacity-70" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Serat</span>
                    <div className="text-base font-black text-foreground">{menu.seratGram} <span className="text-[10px] font-bold text-muted-foreground">g</span></div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-muted/40 border border-border/50 text-center flex flex-col items-center text-muted-foreground">
                <Info size={20} className="mb-2 opacity-50" />
                <p className="text-sm">Nilai gizi belum ditambahkan untuk menu ini.</p>
              </div>
            )}
          </div>

          {/* Komposisi section */}
          <div className="flex-1">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <UtensilsCrossed size={14} /> Komposisi Bahan
            </h3>
            
            {menu.komponen?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {menu.komponen.map((k: any) => (
                  <Badge 
                    key={k.id} 
                    variant="outline" 
                    className="px-3 py-1.5 text-sm font-medium bg-muted/30 hover:bg-muted/60 transition-colors border-border/60"
                  >
                    {k.namaSnapshot}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Belum ada komposisi komponen.</p>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
