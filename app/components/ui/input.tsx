import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, value, ...props }, ref) => {
    // Normalize value to prevent uncontrolled/controlled warning
    // If value is provided (even if null/undefined), convert to empty string to keep it controlled
    // This prevents React warning when value changes from undefined to a string
    const normalizedValue = value === undefined || value === null ? "" : String(value)
    
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        value={normalizedValue}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }


