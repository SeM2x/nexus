import * as React from "react"
import { CheckCircle, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "error" | "info"
  title?: string
  description?: string
  icon?: React.ReactNode
}

const StatusCard = React.forwardRef<HTMLDivElement, StatusCardProps>(
  ({ className, variant = "info", title, description, icon, children, ...props }, ref) => {
    const variantStyles = {
      success: "bg-accent-500/10 border-accent-500/20",
      error: "bg-status-blocked-900/50 border-status-blocked-500", 
      info: "bg-background-700/30 border-background-600"
    }

    const textStyles = {
      success: "text-accent-300",
      error: "text-status-blocked-400",
      info: "text-secondary-400"
    }

    const iconStyles = {
      success: "text-accent-400",
      error: "text-status-blocked-400", 
      info: "text-secondary-400"
    }

    const defaultIcons = {
      success: <CheckCircle className="h-5 w-5" />,
      error: <AlertCircle className="h-5 w-5" />,
      info: <Info className="h-5 w-5" />
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border p-4",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        <div className="flex items-start gap-3">
          <div className={iconStyles[variant]}>
            {icon || defaultIcons[variant]}
          </div>
          <div className="flex-1 space-y-1">
            {title && (
              <h4 className={cn("font-medium", textStyles[variant])}>
                {title}
              </h4>
            )}
            {description && (
              <p className={cn("text-sm", textStyles[variant])}>
                {description}
              </p>
            )}
            {children}
          </div>
        </div>
      </div>
    )
  }
)
StatusCard.displayName = "StatusCard"

export { StatusCard }
