'use client'

import * as React from "react"
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react"

export type ToastVariant = "success" | "error" | "warning" | "info"

export interface ToastOptions {
  /** Optional bold heading shown above the message. */
  title?: string
  /** Milliseconds before auto-dismiss. Defaults to 3000. Pass 0 to disable. */
  duration?: number
}

export interface ToastData {
  id: string
  variant: ToastVariant
  message: string
  title?: string
  duration: number
}

const DEFAULT_DURATION = 3000

// ─── Module-level store (callable from anywhere, no Provider required) ────────
type Listener = (toasts: ToastData[]) => void

let toasts: ToastData[] = []
const listeners = new Set<Listener>()
const timers = new Map<string, ReturnType<typeof setTimeout>>()

function emit() {
  const snapshot = [...toasts]
  listeners.forEach((l) => l(snapshot))
}

export function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id)
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.delete(id)
  }
  emit()
}

function addToast(
  variant: ToastVariant,
  message: string,
  options?: ToastOptions
): string {
  const id = Math.random().toString(36).slice(2) + Date.now().toString(36)
  const duration = options?.duration ?? DEFAULT_DURATION
  toasts = [...toasts, { id, variant, message, title: options?.title, duration }]
  emit()
  if (duration > 0 && typeof window !== "undefined") {
    timers.set(
      id,
      setTimeout(() => dismissToast(id), duration)
    )
  }
  return id
}

/**
 * Global toast API. Import and call from anywhere (events, async handlers, etc.):
 *   import { toast } from "@/components/ui/Toast"
 *   toast.success("Data tersimpan")
 */
export const toast = {
  success: (message: string, options?: ToastOptions) =>
    addToast("success", message, options),
  error: (message: string, options?: ToastOptions) =>
    addToast("error", message, options),
  warning: (message: string, options?: ToastOptions) =>
    addToast("warning", message, options),
  info: (message: string, options?: ToastOptions) =>
    addToast("info", message, options),
  dismiss: dismissToast,
}

/** Hook variant for use inside React components. */
export function useToast() {
  return { toast, dismiss: dismissToast }
}

// ─── Rendering ────────────────────────────────────────────────────────────────
const VARIANT_CONFIG: Record<
  ToastVariant,
  { icon: React.ElementType; accent: string; iconColor: string }
> = {
  success: { icon: CheckCircle2, accent: "border-l-green-500", iconColor: "text-green-600" },
  error: { icon: AlertCircle, accent: "border-l-destructive", iconColor: "text-destructive" },
  warning: { icon: AlertTriangle, accent: "border-l-amber-500", iconColor: "text-amber-600" },
  info: { icon: Info, accent: "border-l-blue-500", iconColor: "text-blue-600" },
}

function ToastCard({ data }: { data: ToastData }) {
  const cfg = VARIANT_CONFIG[data.variant]
  const Icon = cfg.icon
  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto flex w-full items-start gap-3 rounded-lg border border-l-4 ${cfg.accent} bg-card p-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300`}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${cfg.iconColor}`} />
      <div className="min-w-0 flex-1">
        {data.title && (
          <p className="text-sm font-semibold text-foreground">{data.title}</p>
        )}
        <p className="text-sm leading-snug text-muted-foreground break-words">
          {data.message}
        </p>
      </div>
      <button
        onClick={() => dismissToast(data.id)}
        className="shrink-0 rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Tutup notifikasi"
      >
        <X size={16} />
      </button>
    </div>
  )
}

/**
 * Mount once near the app root (e.g. in the dashboard layout) so toasts render.
 * It subscribes to the global store and renders the active stack.
 */
export function Toaster() {
  const [items, setItems] = React.useState<ToastData[]>([])

  React.useEffect(() => {
    listeners.add(setItems)
    setItems([...toasts])
    return () => {
      listeners.delete(setItems)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[200] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
      {items.map((t) => (
        <ToastCard key={t.id} data={t} />
      ))}
    </div>
  )
}
