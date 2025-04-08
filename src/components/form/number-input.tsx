// src/components/form/NumberInput.tsx
import React from "react";
import { Input } from "@/components/ui/input";

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  placeholder?: string;
  onChange?: (value: string) => void;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ placeholder = "", onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
      if (onChange) {
        onChange(value);
      }
    };

    return (
      <Input
        ref={ref}
        placeholder={placeholder}
        inputMode="numeric"
        pattern="[0-9]*"
        onChange={handleChange}
        {...props}
      />
    );
  }
);

NumberInput.displayName = "NumberInput";