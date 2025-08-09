"use client";
import React from "react";
import { UseFormReturn, FieldPath, FieldValues } from "react-hook-form";
import {
  FormField as ShadcnFormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  form: UseFormReturn<TFieldValues>;
  name: TName;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  optional?: boolean;
  showError?: boolean;
  layout?: "default" | "grid" | "flex"; // Add layout option
  headerClassName?: string; // Allow custom label styling
  containerClassName?: string; // Allow custom container styling
  children: React.ReactNode;
}

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  form,
  name,
  label,
  description,
  disabled = false,
  optional = false,
  showError = false,
  layout = "default",
  headerClassName,
  containerClassName,
  children,
}: FormFieldProps<TFieldValues, TName>) {
  const getLayoutClasses = () => {
    switch (layout) {
      case "grid":
        return "grid grid-cols-8 items-center gap-4";
      case "flex":
        return "flex flex-row items-center justify-between gap-4";
      default:
        return "flex flex-col gap-2";
    }
  };

  const getHeaderClasses = () => {
    const base = "capitalize";
    if (layout === "grid") return `${base} col-span-3 text-sm font-medium`;
    return base;
  };

  const getControlClasses = () => {
    if (layout === "grid") return "col-span-5";
    return "";
  };

  return (
    <ShadcnFormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={`w-full ${containerClassName || ""}`}>
          <div className={getLayoutClasses()}>
            <div className={`${getHeaderClasses()} ${headerClassName || ""} flex flex-col gap-1`}>
              {label && (
                <FormLabel>
                  {label}{" "}
                  {optional && (
                    <span className="text-sm text-muted-foreground">(Optional)</span>
                  )}
                </FormLabel>
              )}
              {description && (
                <FormDescription>{description}</FormDescription>
              )}
            </div>
            <FormControl className={getControlClasses()}>
              {React.isValidElement(children)
                ? React.cloneElement(children as React.ReactElement, {
                    disabled,
                    ...field,
                    // Handle both form onChange and custom onValueChange
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange: (value: any) => {
                      // Always update the form
                      field.onChange(value);
                      
                      // Call custom onValueChange if it exists
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const childElement = children as React.ReactElement<{ onChange?: (value: any) => void }>;
                      const originalOnChange = childElement.props.onChange;
                      if (originalOnChange) {
                        originalOnChange(value);
                      }
                    },
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  } as any)
                : children}
            </FormControl>
          </div>
          {showError && <FormMessage />}
        </FormItem>
      )}
    />
  );
}