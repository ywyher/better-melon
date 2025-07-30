"use client"

import { useEffect, useState } from "react";
import FiltersContent from "@/components/filters/content";
import FiltersHeader from "@/components/filters/header";
import {
  Accordion,
  AccordionItem,
} from "@/components/ui/accordion"
import { useIsLarge } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils/utils";

interface AnimeFiltersProps {
    onApply: (variables?: any) => void;
    className?: string;
}

export default function AnimeFilters({ onApply, className = "" }: AnimeFiltersProps) {
    const [value, setValue] = useState("")
    const isLarge = useIsLarge()

    useEffect(() =>{ 
        setValue(isLarge ? 'filters' : '')
    }, [isLarge])

    return (
        <Accordion 
            className={cn(
                "border-1 rounded-lg px-4",
                "min-w-[400px] h-fit",
                className
            )}
            type="single"
            onValueChange={(v) => setValue(v)}
            collapsible
            value={value}
        >
            <AccordionItem value="filters">
                <FiltersHeader onApply={onApply} />
                <FiltersContent />
            </AccordionItem>
        </Accordion>
    )
}