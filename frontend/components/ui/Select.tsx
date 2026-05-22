import * as React from "react"
import { ChevronDown } from "lucide-react"

export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  /** List of options to render. */
  options: SelectOption[]
  /** Optional placeholder shown as the first (empty-value) option. */
  placeholder?: string
  /**
   * Pass a string to render an inline error message below the control,
   * or `true` to apply error styling only.
   */
  error?: string | boolean
  /** Classes applied to the wrapping element (use for width/layout, e.g. "sm:w-[160px]"). */
  wrapperClassName?: string
}

/**
 * Styled native <select> aligned with Input.tsx.
 * Keeps the native onChange signature `(e) => e.target.value` so it is a
 * drop-in replacement for the raw <select> elements used across the app.
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className = "", wrapperClassName = "", options, placeholder, error, disabled, value, ...props },
    ref
  ) => {
    const hasError = Boolean(error)
    const isEmpty = value === "" || value === undefined || value === null

    return (
      <div className={`w-full ${wrapperClassName}`}>
        <div className="relative">
          <select
            ref={ref}
            value={value}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            className={`flex h-9 w-full appearance-none rounded-md border bg-transparent pl-3 pr-9 py-1 text-sm shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              hasError
                ? "border-destructive focus-visible:ring-destructive/40 focus-visible:border-destructive"
                : "border-input focus-visible:ring-primary/40 focus-visible:border-primary"
            } ${isEmpty ? "text-muted-foreground" : "text-foreground"} ${className}`}
            {...props}
          >
            {placeholder !== undefined && (
              <option value="">{placeholder}</option>
            )}
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="text-foreground"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            aria-hidden
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
        </div>
        {typeof error === "string" && error.length > 0 && (
          <p className="mt-1 text-xs text-destructive">{error}</p>
        )}
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
