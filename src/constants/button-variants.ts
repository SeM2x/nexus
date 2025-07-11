import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-background-800",
  {
    variants: {
      variant: {
        default:
          "bg-accent-500 hover:bg-accent-600 disabled:bg-accent-500/50 text-white shadow-lg text-sm",
        secondary:
          "bg-background-700 hover:bg-background-600 border border-background-600 text-white text-sm",
        outline:
          "border border-background-600 bg-background-700/50 hover:bg-background-600/50 text-white text-sm",
        ghost:
          "text-secondary-400 hover:text-white hover:bg-background-700/50 text-sm",
        destructive:
          "bg-status-blocked-600 hover:bg-status-blocked-700 text-white text-sm",
        link: 
          "text-accent-400 hover:text-accent-300 transition-colors duration-200 p-0 h-auto text-sm font-medium",
      },
      size: {
        default: "px-4 py-3",
        sm: "px-3 py-1.5 text-xs",
        lg: "px-6 py-3",
        icon: "w-8 h-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)