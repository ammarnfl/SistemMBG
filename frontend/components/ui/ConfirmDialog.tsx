'use client'

import * as React from "react"
import { AlertTriangle, X } from "lucide-react"
import { Button } from "./Button"

export interface ConfirmDialogProps {
  /** Controls visibility. */
  open: boolean
  title: string
  description?: string
  /** Confirm button label. Defaults to "Konfirmasi". */
  confirmLabel?: string
  /** Cancel button label. Defaults to "Batal". */
  cancelLabel?: string
  /** Use destructive styling + warning icon (for delete actions). */
  destructive?: boolean
  /** Disables buttons and shows a processing label while an async action runs. */
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Controlled confirmation dialog — a styled replacement for native confirm().
 * Renders nothing when `open` is false.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, loading, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => !loading && onCancel()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border/50 bg-card shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 p-5">
          {destructive && (
            <div className="shrink-0 rounded-full bg-destructive/10 p-2 text-destructive">
              <AlertTriangle size={20} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2
              id="confirm-dialog-title"
              className="text-base font-bold text-foreground"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={() => !loading && onCancel()}
            className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex justify-end gap-2 border-t border-border/40 bg-muted/10 p-4">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            size="sm"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Memproses..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
