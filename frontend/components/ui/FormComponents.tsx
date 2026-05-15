import * as React from "react"

// ─── Alert ───────────────────────────────────────────────────────────────────

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "destructive" }
>(({ className = "", variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={`relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground ${
      variant === "destructive"
        ? "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
        : "bg-background text-foreground"
    } ${className}`}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className = "", ...props }, ref) => (
  <h5 ref={ref} className={`mb-1 font-medium leading-none tracking-tight ${className}`} {...props} />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`text-sm [&_p]:leading-relaxed ${className}`} {...props} />
))
AlertDescription.displayName = "AlertDescription"

// ─── Label ───────────────────────────────────────────────────────────────────

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className = "", ...props }, ref) => (
  <label
    ref={ref}
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    {...props}
  />
))
Label.displayName = "Label"

// ─── Textarea ────────────────────────────────────────────────────────────────

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = "", ...props }, ref) => (
  <textarea
    ref={ref}
    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-all duration-200 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
))
Textarea.displayName = "Textarea"

// ─── RadioGroup ──────────────────────────────────────────────────────────────

type RadioGroupContextValue = {
  value?: string
  onValueChange?: (val: string) => void
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({})

const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { onValueChange?: (val: string) => void; value?: string }
>(({ className = "", onValueChange, value, children, ...props }, ref) => (
  <RadioGroupContext.Provider value={{ value, onValueChange }}>
    <div ref={ref} className={`grid gap-2 ${className}`} {...props} role="radiogroup">
      {children}
    </div>
  </RadioGroupContext.Provider>
))
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className = "", value, id, ...props }, ref) => {
  const context = React.useContext(RadioGroupContext)
  const isChecked = context.value === value

  return (
    <button
      type="button"
      ref={ref}
      id={id}
      role="radio"
      aria-checked={isChecked}
      onClick={() => context.onValueChange?.(value)}
      className={`aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center ${className}`}
      {...props}
    >
      {isChecked && (
        <div className="h-2.5 w-2.5 rounded-full bg-current" />
      )}
    </button>
  )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { Alert, AlertTitle, AlertDescription, Label, Textarea, RadioGroup, RadioGroupItem }
