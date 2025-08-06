"use client";

import { Calendar } from "@/components/ui/calendar";
import React, { forwardRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export const CalendarInput = forwardRef<
  HTMLDivElement,
  {
    value?: Date;
    onChange?: (value: Date | undefined) => void;
    disabled?: boolean;
    required?: boolean;
  }
>(({ value, onChange, disabled, required, ...props }, ref) => {
  const [open, setOpen] = useState<boolean>(false)
  const selectedDate = value;
  
  const handleSelect = (date: Date | undefined) => {
    if (onChange && date) {
      onChange(date);
      setOpen(false)
    }
  };

  return (
    <div className="relative w-full" ref={ref}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className="w-full flex justify-start"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar 
            mode="single" 
            selected={selectedDate} 
            onSelect={handleSelect}
            disabled={disabled}
            required={required}
            captionLayout="dropdown"
            {...props}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
});

CalendarInput.displayName = "CalendarInput"; // Fixed the display name