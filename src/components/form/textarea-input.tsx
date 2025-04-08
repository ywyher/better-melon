// src/components/form/TextareaInput.tsx
import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface TextareaInputProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  placeholder?: string;
  maxLength?: number;
  value?: string;
  onChange?: (value: string) => void;
}

export const TextareaInput = React.forwardRef<HTMLTextAreaElement, TextareaInputProps>(
  ({ placeholder = "", maxLength = 250, value = "", onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <div className="w-full">
        <Textarea
          ref={ref}
          placeholder={placeholder}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          {...props}
        />
        {maxLength && (
          <div className="text-xs text-muted-foreground text-right mt-1">
            {value?.length || 0}/{maxLength}
          </div>
        )}
      </div>
    );
  }
);

TextareaInput.displayName = "TextareaInput";