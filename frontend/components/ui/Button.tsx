import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    let variantStyles = "";
    if (variant === "default") variantStyles = "bg-primary text-primary-foreground shadow hover:bg-primary/90";
    if (variant === "destructive") variantStyles = "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90";
    if (variant === "outline") variantStyles = "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground";
    if (variant === "secondary") variantStyles = "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80";
    if (variant === "ghost") variantStyles = "hover:bg-accent hover:text-accent-foreground";
    if (variant === "link") variantStyles = "text-primary underline-offset-4 hover:underline";

    let sizeStyles = "";
    if (size === "default") sizeStyles = "h-9 px-4 py-2";
    if (size === "sm") sizeStyles = "h-8 rounded-md px-3 text-xs";
    if (size === "lg") sizeStyles = "h-10 rounded-md px-8";
    if (size === "icon") sizeStyles = "h-9 w-9";

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
