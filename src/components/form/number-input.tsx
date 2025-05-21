import React from "react";
import { Input } from "@/components/ui/input";

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'onBlur'> {
  placeholder?: string;
  value?: number | string;
  onChange?: (value: number | null) => void;
  onBlur?: (value: number | null) => void;
  max?: number;
}

export function NumberInput({ 
  placeholder = "", 
  onChange, 
  onBlur,
  value,
  max,
  ...props 
}: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const stringValue = e.target.value.replace(/\D/g, "") // Remove non-numeric characters
    
    const numericValue = stringValue ? Number(stringValue) : null;
    
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

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const stringValue = e.target.value.replace(/\D/g, "");
    const numericValue = stringValue ? Number(stringValue) : null;
    
    // Apply max constraint on blur as well
    const finalValue = max !== undefined && numericValue !== null && numericValue > max
      ? max
      : numericValue;
    
    if (onBlur) {
      onBlur(finalValue);
    }
  };

  const displayValue = value !== undefined && value !== null ? String(value) : "";

  return (
    <Input
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      {...props}
    />
  );
}

NumberInput.displayName = "NumberInput";