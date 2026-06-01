'use client'

import * as React from "react"
import { X } from "lucide-react"

export interface ImageLightboxProps {
  /** Image URL. When null, nothing renders. */
  src: string | null
  alt?: string
  onClose: () => void
}

/**
 * Full-screen image preview overlay. Closes on backdrop click, the × button,
 * or Escape. Replaces the ad-hoc lightbox blocks duplicated across pages.
 */
export function ImageLightbox({ src, alt = "Gambar", onClose }: ImageLightboxProps) {
  React.useEffect(() => {
    if (!src) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [src, onClose])

  if (!src) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="self-end rounded-full bg-white/20 p-1.5 text-white transition-colors hover:bg-white/30"
          onClick={onClose}
          aria-label="Tutup"
        >
          <X size={20} />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl"
        />
        <p className="text-xs text-white/60">Ketuk di luar atau tekan Esc untuk menutup</p>
      </div>
    </div>
  )
}
