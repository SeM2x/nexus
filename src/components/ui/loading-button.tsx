import * as React from "react"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { type VariantProps } from "class-variance-authority"
import { buttonVariants } from "@/constants/button-variants" 

interface LoadingButtonProps 
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  loadingText?: string
  asChild?: boolean
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ children, loading = false, loadingText, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <LoadingSpinner text={loadingText || "Loading..."} />
        ) : (
          children
        )}
      </Button>
    )
  }
)
LoadingButton.displayName = "LoadingButton"

export { LoadingButton }
