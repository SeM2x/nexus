import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface InputWithIconProps extends React.ComponentProps<"input"> {
  label?: string
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: string
  helperText?: string
}

const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ className, label, icon, rightIcon, error, helperText, id, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={id} className="text-sm font-medium text-secondary-300">
            {label}
          </Label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-secondary-500">
                {icon}
              </div>
            </div>
          )}
          <Input
            id={id}
            ref={ref}
            className={cn(
              icon && "pl-10",
              rightIcon && "pr-12",
              error && "border-status-blocked-500",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-status-blocked-400">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-xs text-secondary-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
InputWithIcon.displayName = "InputWithIcon"

export { InputWithIcon }
