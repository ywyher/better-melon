// src/components/form/PasswordInput.tsx
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ placeholder = "", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState<boolean>(false);

    return (
      <div className="relative w-full">
        <Input
          ref={ref}
          autoComplete="new-password"
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          {...props}
        />
        <button
          type="button"
          className="absolute text-gray-500 right-3 top-2"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";