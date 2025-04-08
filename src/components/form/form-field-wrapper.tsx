// src/components/form/FormField.tsx
"use client";

import React from "react";
import { UseFormReturn, FieldPath, FieldValues } from "react-hook-form";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Controller } from "react-hook-form";

interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  form: UseFormReturn<TFieldValues>;
  name: TName;
  label?: string;
  defaultValue?: string | number | string[];
  disabled?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  form,
  name,
  label,
  defaultValue,
  disabled = false,
  optional = false,
  children,
}: FormFieldProps<TFieldValues, TName>) {
  const errorMessage = form.formState.errors[name]?.message as string | undefined;
  
  return (
    <Controller
      control={form.control}
      name={name}
      defaultValue={defaultValue as any}
      disabled={disabled}
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
                  ...field,
                  ...(disabled !== undefined ? { disabled } : {}),
                })
              : children}
          </FormControl>
          <FormMessage>{errorMessage}</FormMessage>
        </FormItem>
      )}
    />
  );
}