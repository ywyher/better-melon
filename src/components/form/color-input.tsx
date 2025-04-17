// src/components/form/color-input.tsx
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ColorInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string;
  onChange?: (value: string) => void;
}

export const ColorInput =
  ({ value = "#FFFFFF", onChange, className, ...props }: ColorInputProps) => {
    const [localValue, setLocalValue] = useState(value);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      
      // Only propagate valid color values
      if (/^#([0-9A-F]{3}){1,2}$/i.test(newValue) || /^#([0-9A-F]{6})$/i.test(newValue)) {
        onChange?.(newValue);
      }
    };

    useEffect(() => {
      if(!value) return
      setLocalValue(value)
    }, [value])

    const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange?.(newValue);
    };

    return (
      <div className="flex items-center gap-2 w-full">
        <Popover>
          <PopoverTrigger asChild>
            <button 
              type="button"
              className="w-9 h-9 rounded-md border border-input flex items-center justify-center overflow-hidden"
              aria-label="Pick a color"
            >
              <div 
                className="w-full h-full" 
                style={{ backgroundColor: localValue }}
              />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <div className="flex flex-col gap-2">
              <input 
                type="color" 
                value={localValue}
                onChange={handleColorPickerChange}
                className="w-40 h-40 cursor-pointer border-none p-0 m-0"
              />
            </div>
          </PopoverContent>
        </Popover>
        <Input
          type="text"
          value={localValue}
          onChange={handleInputChange}
          placeholder="#FFFFFF"
          className={cn("flex-1", className)}
          {...props}
        />
      </div>
    );
  }

ColorInput.displayName = "ColorInput";