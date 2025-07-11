import * as React from "react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg"
  text?: string
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = "default", text, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      default: "h-5 w-5", 
      lg: "h-6 w-6"
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center", className)}
        {...props}
      >
        <div className={cn(
          "animate-spin rounded-full border-b-2 border-white",
          sizeClasses[size]
        )} />
        {text && (
          <span className="ml-2 text-white">{text}</span>
        )}
      </div>
    )
  }
)
LoadingSpinner.displayName = "LoadingSpinner"

export { LoadingSpinner }
