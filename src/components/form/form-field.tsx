"use client";
import React from "react";
import { UseFormReturn, FieldPath, FieldValues, Controller } from "react-hook-form";
import {
  FormField as ShadcnFormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  form: UseFormReturn<TFieldValues>;
  name: TName;
  label?: React.ReactNode;
  disabled?: boolean;
  optional?: boolean;
  showError?: boolean;
  children: React.ReactNode;
}

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  form,
  name,
  label,
  disabled = false,
  optional = false,
  showError = false,
  children,
}: FormFieldProps<TFieldValues, TName>) {
  return (
    <ShadcnFormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          {label && (
            <FormLabel className="capitalize">
              {label}{" "}
              {optional && (
                <span className="text-sm text-muted-foreground">(Optional)</span>
              )}
            </FormLabel>
          )}
          <FormControl>
            {React.isValidElement(children)
              ? React.cloneElement(children as React.ReactElement, {
                  disabled,
                  ...field
                })
              : children}
          </FormControl>
          {showError && (
            <FormMessage />
          )}
        </FormItem>
      )}
    />
  );
}