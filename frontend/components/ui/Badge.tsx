import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  let variantStyles = "";
  if (variant === "default") variantStyles = "border-transparent bg-primary text-primary-foreground shadow";
  if (variant === "secondary") variantStyles = "border-transparent bg-secondary text-secondary-foreground";
  if (variant === "destructive") variantStyles = "border-transparent bg-destructive text-destructive-foreground shadow";
  if (variant === "outline") variantStyles = "text-foreground";
  if (variant === "success") variantStyles = "border-transparent bg-green-100 text-green-800";
  if (variant === "warning") variantStyles = "border-transparent bg-orange-100 text-orange-800";

  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variantStyles} ${className}`}
      {...props}
    />
  )
}

export { Badge }
