import React from "react";
import { Input } from "@/components/ui/input";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ placeholder = "", ...props }, ref) => {
    return <Input ref={ref} placeholder={placeholder} {...props} />;
  }
);

TextInput.displayName = "TextInput";