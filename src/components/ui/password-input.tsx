import * as React from "react"
import { Eye, EyeOff, Lock } from "lucide-react"
import { InputWithIcon } from "@/components/ui/input-with-icon"

interface PasswordInputProps extends Omit<React.ComponentProps<"input">, "type"> {
  label?: string
  error?: string
  helperText?: string
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label = "Password", error, helperText, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword)
    }

    return (
      <InputWithIcon
        ref={ref}
        type={showPassword ? "text" : "password"}
        label={label}
        icon={<Lock />}
        rightIcon={
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="text-secondary-500 hover:text-secondary-300 transition-colors duration-200"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        }
        error={error}
        helperText={helperText}
        {...props}
      />
    )
  }
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
