import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { HexColorPicker } from "react-colorful";
import { useDebounce } from "use-debounce";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ColorInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string;
  onChange?: (value: string) => void;
}

export const ColorInput = ({ value = "#FFFFFF", onChange, className, ...props }: ColorInputProps) => {
  const [localValue, setLocalValue] = useState(value);
  const [debouncedColor] = useDebounce(localValue, 500);
  const fromUserInteraction = useRef(false);

  useEffect(() => {
    if (value && value !== localValue) {
      setLocalValue(value);
      fromUserInteraction.current = false;
    }
  }, [value]);

  useEffect(() => {
    if (
      fromUserInteraction.current &&
      debouncedColor !== value &&
      /^#([0-9A-F]{3}){1,2}$/i.test(debouncedColor)
    ) {
      onChange?.(debouncedColor);
    }
  }, [debouncedColor, onChange, value]);

  const handleColorChange = (newColor: string) => {
    fromUserInteraction.current = true;
    setLocalValue(newColor);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    fromUserInteraction.current = true;
    setLocalValue(e.target.value);
  };

  const handleInputBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    fromUserInteraction.current = true;
    if (/^#([0-9A-F]{3}){1,2}$/i.test(newValue)) {
      onChange?.(newValue);
    }
  };


  return (
    <div className="flex items-center gap-2 w-full">
      <Popover>
        <PopoverTrigger>
          <div 
            className="w-8 h-8 rounded-md cursor-pointer" 
            style={{ backgroundColor: localValue }}
          ></div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <HexColorPicker color={localValue} onChange={handleColorChange} />
        </PopoverContent>
      </Popover>
      <Input
        type="text"
        value={localValue}
        onBlur={handleInputBlur}
        onChange={handleInputChange}
        placeholder="#FFFFFF"
        className={cn("flex-1", className)}
        {...props}
      />
    </div>
  );
};

ColorInput.displayName = "ColorInput";