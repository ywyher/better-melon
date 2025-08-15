"use client";

import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  defaultValue?: string;
}

export function SelectInput({
  options,
  placeholder = "Select an option",
  className = "",
  value,
  onChange,
  disabled = false,
  defaultValue,
  ...props
}: SelectInputProps) {
  return (
    <Select 
      onValueChange={onChange} 
      value={value}
      disabled={disabled}
      defaultValue={defaultValue}
      {...props}
    >
      <SelectTrigger className={`w-full cursor-pointer ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

SelectInput.displayName = "SelectInput";