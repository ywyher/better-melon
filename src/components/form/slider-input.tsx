"use client";
import React, { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";

interface SliderInputProps {
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  value?: number; 
  onChange?: (value: number) => void;
  disabled?: boolean;
  showValue?: boolean;
  unit?: 'px' | 'percentage';
}

export function SliderInput({
  min = 0,
  max = 100,
  step = 1,
  className = "",
  value = 0,
  onChange,
  disabled = false,
  showValue = false,
  unit,
  ...props
}: SliderInputProps) {
  const [displayValue, setDisplayValue] = useState(value);
  
  // Update display value when the prop changes
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  // Format the value based on unit
  const formattedValue = () => {
    if (unit === 'percentage') {
      return `${Math.round(displayValue * 100)}%`;
    }
    return `${displayValue}${unit || ''}`;
  };

  return (
    <div className="flex flex-row-reverse gap-3 w-full">
      {showValue && (
        <div className="flex justify-end mb-1">
          <span className="text-xs text-muted-foreground bg-foreground/10 px-2 py-1 rounded-md">
            {formattedValue()}
          </span>
        </div>
      )}
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(values) => {
          setDisplayValue(values[0]);
          onChange && onChange(values[0]);
        }}
        className={`w-full ${className}`}
        disabled={disabled}
        {...props}
      />
    </div>
  );
}

SliderInput.displayName = "SliderInput";