import React from "react";
import { Input } from "@/components/ui/input";

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  placeholder?: string;
  value?: number | string;
  onChange?: (value: number | null) => void;
  max?: number;
}

export function NumberInput({ 
  placeholder = "", 
  onChange, 
  value, 
  max,
  ...props 
}: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const stringValue = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    
    const numericValue = stringValue ? parseInt(stringValue, 10) : null;
    
    if (max !== undefined && numericValue !== null && numericValue > max) {
      if (onChange) {
        onChange(max);
      }
      return;
    }
    
    if (onChange) {
      onChange(numericValue);
    }
  };

  const displayValue = value !== undefined && value !== null ? String(value) : "";

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      value={displayValue}
      onChange={handleChange}
    />
  );
}

NumberInput.displayName = "NumberInput";