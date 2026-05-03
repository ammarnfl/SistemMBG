import * as React from "react"

const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { onValueChange?: (val: string) => void; value?: string }
>(({ className = "", onValueChange, value, children, ...props }, ref) => {
  // Pass value and onChange to children if needed, but here we can just map children
  // Or simpler: let the user manage it, but shadcn RadioGroup passes context.
  // We'll provide a simplified context.
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div ref={ref} className={`grid gap-2 ${className}`} {...props} role="radiogroup">
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
})
RadioGroup.displayName = "RadioGroup"

type RadioGroupContextValue = {
  value?: string
  onValueChange?: (val: string) => void
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({})

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
        <span className="flex items-center justify-center">
          <div className="h-2.5 w-2.5 rounded-full bg-current" />
        </span>
      )}
    </button>
  )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
