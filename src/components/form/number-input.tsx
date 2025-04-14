import React from "react";
import { Input } from "@/components/ui/input";

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  placeholder?: string;
  value?: number | string;
  onChange?: (value: number) => void;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ placeholder = "", onChange, value, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const stringValue = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
      const numericValue = stringValue ? parseInt(stringValue, 10) : 0;
      
      if (onChange) {
        onChange(numericValue);
      }
    };

    return (
      <Input
        ref={ref}
        placeholder={placeholder}
        inputMode="numeric"
        pattern="[0-9]*"
        value={value ?? ""}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

NumberInput.displayName = "NumberInput";