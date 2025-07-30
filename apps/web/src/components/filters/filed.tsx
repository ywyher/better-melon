"use client";

import { ReactNode } from "react";

interface FilterFieldProps {
  label: string;
  children: ReactNode;
}

export default function FilterField({ label, children }: FilterFieldProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <p className="font-mono">{label}</p>
      {children}
    </div>
  );
}
