"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
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
  className?: string
};

export function Combobox({
  options = [],
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No option found.",
  buttonWidth = "w-full",
  contentWidth = "w-full", 
  onChange,
  defaultValue = "",
  className
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(defaultValue)

  // Sync internal state with defaultValue prop changes
  React.useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

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

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setValue("")
    if (onChange) {
      onChange("")
    }
  }

  const handleButtonClick = () => {
    setOpen(!open)
  }

  const getSelectedLabel = () => {
    if (!value) return placeholder
    const selected = normalizedOptions.find(option => option.value === value)
    return selected?.label || placeholder
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={`${buttonWidth} relative`}>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between text-muted-foreground pr-16",
              className
            )}
            onClick={handleButtonClick}
          >
            {getSelectedLabel()}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
          {value && (
            <Button
              variant={'ghost'}
              className="
                absolute right-7 top-1/2 -translate-y-1/2 
                rounded-sm hover:bg-transparent
                opacity-50 hover:opacity-100 hover:text-destructive
              "
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
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