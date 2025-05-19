'use client'

import { ReactNode } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TooltipWrapper({
    children,
    trigger = <Info size={16} color="orange" />,
    className = "",
}: {
    children: ReactNode;
    trigger?: ReactNode;
    className?: string;
}) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {trigger}
                </TooltipTrigger>
                <TooltipContent className={cn(className)}>
                    {children}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}