import React from "react";
import { Input } from "@/components/ui/input";

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  placeholder?: string;
  value?: number | string;
  onChange?: (value: number | null) => void;
}

export function NumberInput({ 
  placeholder = "", 
  onChange, 
  value, 
  ...props 
}: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const stringValue = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    const numericValue = stringValue ? parseInt(stringValue, 10) : null;
    
    if (onChange) {
      onChange(numericValue);
    }
  };

  return (
    <Input
      placeholder={placeholder}
      inputMode="numeric"
      pattern="[0-9]*"
      value={value ?? ""}
      onChange={handleChange}
      {...props}
    />
  );
}

NumberInput.displayName = "NumberInput";