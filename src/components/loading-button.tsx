import React from "react";
import { Button } from "@/components/ui/button";

export default function LoadingButton({
  isLoading,
  variant = "default",
  size = "default",
  onClick,
  children,
  disabled,
  className,
}: {
  isLoading: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary";
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Button
      type="submit"
      className={`w-full ${className}`}
      disabled={disabled || isLoading}
      size={size}
      variant={variant}
      onClick={onClick}
    >
      {isLoading ? (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          ></path>
        </svg>
      ) : (
        children
      )}
    </Button>
  );
}