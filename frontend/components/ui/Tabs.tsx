import * as React from "react"

export interface TabItem {
  value: string
  label: React.ReactNode
  /** Optional leading icon (lucide component). */
  icon?: React.ElementType
}

export interface TabsProps {
  items: TabItem[]
  /** Currently active tab value (controlled). */
  value: string
  onValueChange: (value: string) => void
  /**
   * "pill" (default) matches the SINGLE/BATCH segmented control used across
   * the app. "underline" matches the report-style tab bar.
   */
  variant?: "pill" | "underline"
  className?: string
}

/**
 * Controlled tab strip. Replaces the hand-rolled tab blocks repeated across
 * the admin / distribusi / menu pages.
 */
export function Tabs({
  items,
  value,
  onValueChange,
  variant = "pill",
  className = "",
}: TabsProps) {
  if (variant === "underline") {
    return (
      <div
        role="tablist"
        className={`flex overflow-x-auto border-b border-border/40 ${className}`}
      >
        {items.map((item) => {
          const active = item.value === value
          const Icon = item.icon
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onValueChange(item.value)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-6 py-3 text-sm font-bold transition-colors ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground"
              }`}
            >
              {Icon && <Icon size={16} />}
              {item.label}
            </button>
          )
        })}
      </div>
    )
  }

  // pill (default)
  return (
    <div
      role="tablist"
      className={`flex w-fit gap-1 rounded-lg border border-border/50 bg-secondary/50 p-1 ${className}`}
    >
      {items.map((item) => {
        const active = item.value === value
        const Icon = item.icon
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onValueChange(item.value)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              active
                ? "bg-white text-primary shadow-sm ring-1 ring-border/50"
                : "text-muted-foreground hover:bg-white/50 hover:text-foreground"
            }`}
          >
            {Icon && <Icon size={16} />}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
