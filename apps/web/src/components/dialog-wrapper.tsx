'use client'

import React, { Dispatch, SetStateAction, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import useMediaQuery, { breakpoints } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils/utils";

type DialogWrapperProps = {
  title?: React.ReactNode;
  description?: React.ReactNode
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  open?: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
  breakpoint?: 'small' | 'medium' | 'large' | 'xLarge'
}

export default function DialogWrapper({ 
  title,
  description,
  children, 
  className = "", 
  headerClassName,
  open,
  setOpen,
  trigger,
  defaultOpen = false,
  breakpoint = 'small'
}: DialogWrapperProps) {
  const isBreakpoint = useMediaQuery(breakpoints[breakpoint]);
  
  // Internal state for uncontrolled mode
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  
  // Determine if component is in controlled or uncontrolled mode
  const isControlled = open !== undefined && setOpen !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const onOpenChange = isControlled 
    ? setOpen 
    : setInternalOpen;

  if (isBreakpoint) {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
        <DrawerContent className="min-h-[85vh] max-h-[85vh]">
          <div className={cn("pb-3 px-3", className)}>
            <DrawerHeader className={cn(
              (title || description) 
              ? "px-6 py-4 border-b bg-background/95 backdrop-blur h-fit"
              : "p-0"
            )}>
              <DrawerTitle className="text-xl font-semibold">{title}</DrawerTitle>
              <DrawerDescription className="text-sm text-muted-foreground mt-1">
                {description}
              </DrawerDescription>
            </DrawerHeader>
            {children}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={cn(
        className,
        'min-w-fit'
      )}>
        <DialogHeader className={cn(
          (title || description) && "px-4 py-4 border-b bg-background/95 backdrop-blur h-fit",
          headerClassName
        )}>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            {description}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}