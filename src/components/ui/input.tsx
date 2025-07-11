import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "block w-full px-3 py-3 border border-background-600 rounded-lg bg-background-700/50 text-white placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors duration-200 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
