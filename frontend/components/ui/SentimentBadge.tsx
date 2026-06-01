import * as React from "react"

export type Sentimen = "POSITIF" | "NETRAL" | "NEGATIF"

/** Single source of truth for sentiment label/colors. */
export const SENTIMEN_CONFIG: Record<Sentimen, { label: string; color: string; dot: string }> = {
  POSITIF: { label: "Positif", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  NETRAL: { label: "Netral", color: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
  NEGATIF: { label: "Negatif", color: "bg-red-100 text-red-700", dot: "bg-red-500" },
}

export interface SentimentBadgeProps {
  sentimen: string | null
  /** Confidence score 0..1; rendered as a percentage when present. */
  skor?: number | null
  /** "sm" (compact, default) for lists/cards, "md" for tables/detail. */
  size?: "sm" | "md"
}

export function SentimentBadge({ sentimen, skor = null, size = "sm" }: SentimentBadgeProps) {
  if (!sentimen || !(sentimen in SENTIMEN_CONFIG)) {
    return <span className="text-[10px] text-muted-foreground italic">Belum dianalisis</span>
  }
  const cfg = SENTIMEN_CONFIG[sentimen as Sentimen]
  const sizeCls = size === "md" ? "px-2.5 py-1 text-[11px]" : "px-2 py-0.5 text-[10px]"
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full font-bold ${sizeCls} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
      {skor !== null && skor !== undefined && <span className="opacity-60">({Math.round(skor * 100)}%)</span>}
    </div>
  )
}
