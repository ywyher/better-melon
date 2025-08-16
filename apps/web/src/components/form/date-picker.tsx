"use client";

import React, { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";

// Single date picker props
interface SingleDatePickerProps {
  mode?: "single";
  placeholder?: string;
  className?: string;
  value?: Date | undefined;
  onChange?: (value: Date | undefined) => void;
  disabled?: boolean;
  defaultValue?: Date | undefined;
  captionLayout?: "dropdown" | "label" | "dropdown-months" | "dropdown-years";
  fromYear?: number;
  toYear?: number;
}

// Range date picker props
interface RangeDatePickerProps {
  mode: "range";
  placeholder?: string;
  className?: string;
  value?: DateRange | undefined;
  onChange?: (value: DateRange | undefined) => void;
  disabled?: boolean;
  defaultValue?: DateRange | undefined;
  captionLayout?: "dropdown" | "label" | "dropdown-months" | "dropdown-years";
}

type DatePickerProps = SingleDatePickerProps | RangeDatePickerProps;

export function DatePicker(props: DatePickerProps) {
  const {
    mode = "single",
    placeholder,
    className = "",
    value,
    onChange,
    disabled = false,
    defaultValue,
    captionLayout = "dropdown",
    ...otherProps
  } = props;

  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<Date | DateRange | undefined>(
    defaultValue
  );

  const currentValue = value !== undefined ? value : internalValue;

  const formatDisplayValue = () => {
    if (!currentValue) {
      return placeholder || (mode === "single" ? "Select date" : "Select date range");
    }

    if (mode === "single") {
      return (currentValue as Date).toLocaleDateString();
    } else {
      const range = currentValue as DateRange;
      if (range?.from && range?.to) {
        return `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`;
      } else if (range?.from) {
        return `${range.from.toLocaleDateString()} - ...`;
      }
      return placeholder || "Select date range";
    }
  };

  if (mode === "single") {
    const handleSingleSelect = (selectedDate: Date | undefined) => {
      if (value === undefined) {
        setInternalValue(selectedDate);
      }
      (onChange as SingleDatePickerProps['onChange'])?.(selectedDate);
      setOpen(false);
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-between font-normal ${className}`}
            disabled={disabled}
            {...otherProps}
          >
            <span className="truncate">{formatDisplayValue()}</span>
            <ChevronDownIcon className="h-4 w-4 opacity-50 flex-shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={currentValue as Date}
            onSelect={handleSingleSelect}
            captionLayout={captionLayout}
          />
        </PopoverContent>
      </Popover>
    );
  }

  // Range mode
  const handleRangeSelect = (selectedRange: DateRange | undefined) => {
    if (value === undefined) {
      setInternalValue(selectedRange);
    }
    (onChange as RangeDatePickerProps['onChange'])?.(selectedRange);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-between font-normal ${className}`}
          disabled={disabled}
          {...otherProps}
        >
          <span className="truncate">{formatDisplayValue()}</span>
          <ChevronDownIcon className="h-4 w-4 opacity-50 flex-shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="range"
          selected={currentValue as DateRange}
          onSelect={handleRangeSelect}
          captionLayout={captionLayout}
        />
      </PopoverContent>
    </Popover>
  );
}

DatePicker.displayName = "DatePicker";