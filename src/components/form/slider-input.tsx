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
  onBlur?: (value: number) => void;
  disabled?: boolean;
  showValue?: boolean;
  unit?: 'px' | 'percentage';
}

export function SliderInput({
  min = 0,
  max = 100,
  step = 1,
  className = "",
  value: propValue = 0,
  onChange,
  onBlur,
  disabled = false,
  showValue = false,
  unit,
  ...props
}: SliderInputProps) {
  const [internalValue, setInternalValue] = useState(propValue);
  
  useEffect(() => {
    setInternalValue(propValue);
  }, [propValue]);

  const formattedValue = () => {
    if (unit === 'percentage') {
      return `${Math.round(internalValue * 100)}%`;
    }
    return `${internalValue}${unit || ''}`;
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
        onBlur={() => {
          onBlur && onBlur(internalValue);
        }}
        value={[internalValue]}
        onValueChange={(values) => {
          const newValue = values[0];
          setInternalValue(newValue);
          onChange && onChange(newValue);
        }}
        className={`w-full ${className}`}
        disabled={disabled}
        {...props}
      />
    </div>
  );
}

SliderInput.displayName = "SliderInput";