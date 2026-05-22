import * as React from "react"
import {
  FileText,
  Send,
  PackageCheck,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"

export type DistribusiStatus =
  | "DRAFT"
  | "DIKIRIM"
  | "DITERIMA"
  | "BERMASALAH"
  | "SELESAI"

interface StatusConfigItem {
  /** Human-readable label. */
  label: string
  icon: React.ElementType
  /** Tailwind classes for background + text. Each status uses a distinct hue. */
  className: string
}

/**
 * Single source of truth for distribusi status presentation.
 * Every status has a distinct color so no two ever look the same.
 */
export const DISTRIBUSI_STATUS_CONFIG: Record<DistribusiStatus, StatusConfigItem> = {
  DRAFT: { label: "Draft", icon: FileText, className: "bg-slate-100 text-slate-700" },
  DIKIRIM: { label: "Dalam Perjalanan", icon: Send, className: "bg-blue-100 text-blue-700" },
  DITERIMA: { label: "Diterima", icon: PackageCheck, className: "bg-cyan-100 text-cyan-700" },
  BERMASALAH: { label: "Bermasalah", icon: AlertTriangle, className: "bg-red-100 text-red-700" },
  SELESAI: { label: "Selesai", icon: CheckCircle2, className: "bg-green-100 text-green-700" },
}

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** Distribusi status. Unknown values render a neutral fallback. */
  status: DistribusiStatus | string
  /** Show the leading status icon. Defaults to true. */
  showIcon?: boolean
}

export function StatusBadge({
  status,
  showIcon = true,
  className = "",
  ...props
}: StatusBadgeProps) {
  const cfg =
    DISTRIBUSI_STATUS_CONFIG[status as DistribusiStatus] ?? {
      label: String(status),
      icon: FileText,
      className: "bg-muted text-muted-foreground",
    }
  const Icon = cfg.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.className} ${className}`}
      {...props}
    >
      {showIcon && <Icon size={12} aria-hidden />}
      {cfg.label}
    </span>
  )
}
