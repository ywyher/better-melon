"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Option } from "@/types"

type ComboboxProps = {
  options?: Option[] | string[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  buttonWidth?: string;
  contentWidth?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
};

export function Combobox({
  options = [],
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No option found.",
  buttonWidth = "w-full",
  contentWidth = "w-full", 
  onChange,
  defaultValue = ""
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(defaultValue)

  const normalizedOptions: Option[] = React.useMemo(() => {
    if (!options.length) return []
    
    if (typeof options[0] === 'object' && options[0] !== null) {
      return options as Option[]
    }
    
    return (options as string[]).map(item => ({
      value: item,
      label: item.charAt(0).toUpperCase() + item.slice(1)
    }))
  }, [options])

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === value ? "" : currentValue
    setValue(newValue)
    setOpen(false)
    if (onChange) {
      onChange(newValue)
    }
  }

  const getSelectedLabel = () => {
    if (!value) return placeholder
    const selected = normalizedOptions.find(option => option.value === value)
    return selected?.label || placeholder
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`${buttonWidth} justify-between text-muted-foreground`}
        >
          {getSelectedLabel()}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={`${contentWidth} p-0`}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {normalizedOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}