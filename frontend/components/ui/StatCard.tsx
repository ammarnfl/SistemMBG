import * as React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card } from "./Card"

export interface StatCardProps {
  icon: React.ElementType
  label: string
  value: React.ReactNode
  /** Left accent border class, e.g. "border-l-primary", "border-l-blue-500". */
  accentClass?: string
  /** Small muted note shown beside the value (e.g. "Minggu ini"). */
  note?: string
  /** Extra node rendered under the value (e.g. a star rating). */
  extra?: React.ReactNode
  /** If set, the whole card becomes a link and shows a chevron affordance. */
  href?: string
}

/**
 * Shared statistic tile. Models the clean Admin-dashboard style so every role's
 * dashboard reads as one product (soft tinted icon box, uppercase muted label,
 * 3xl bold value, left accent border).
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  accentClass = "border-l-primary",
  note,
  extra,
  href,
}: StatCardProps) {
  const inner = (
    <Card className={`group h-full border-l-4 ${accentClass} transition-all hover:shadow-md`}>
      <div className="flex items-center gap-4 p-5">
        <div className="shrink-0 rounded-xl bg-muted/60 p-3 transition-colors group-hover:bg-primary/10">
          <Icon size={24} className="text-muted-foreground transition-colors group-hover:text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <div className="mt-0.5 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {note && <span className="text-xs font-medium text-muted-foreground">{note}</span>}
          </div>
          {extra && <div className="mt-1">{extra}</div>}
        </div>
        {href && (
          <ArrowRight
            size={16}
            className="shrink-0 text-muted-foreground/40 transition-colors group-hover:text-primary"
          />
        )}
      </div>
    </Card>
  )

  return href ? (
    <Link href={href} className="block h-full">
      {inner}
    </Link>
  ) : (
    inner
  )
}
