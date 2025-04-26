import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function LoadingButton({
  isLoading,
  variant = "default",
  size = "default",
  onClick,
  children,
  disabled,
  className,
  type = 'submit',
}: {
  isLoading: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary";
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  type?: 'submit' | 'button'
}) {
  return (
    <Button
      type={type}
      className={`w-full ${className}`}
      disabled={disabled || isLoading}
      size={size}
      variant={variant}
      onClick={onClick}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {children}
        </>
      ) : (
        <>
          {children}
        </>
      )}
    </Button>
  );
}