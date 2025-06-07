"use client";

import React from "react";
import { Switch } from "@/components/ui/switch";

interface SwitchInputProps {
  value?: boolean;
  onChange?: (value: boolean) => void;
  className?: string;
  disabled?: boolean;
  name?: string;
}

export function SwitchInput({
  value,
  onChange,
  ...props
}: SwitchInputProps) {
  return (
    <Switch
      checked={value}
      onCheckedChange={onChange}
      {...props}
    />
  );
}

SwitchInput.displayName = "SwitchInput";