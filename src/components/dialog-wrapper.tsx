import React, { Dispatch, SetStateAction, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import useMediaQuery, { breakpoints } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

type DialogWrapperProps = {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
  breakpoint?: 'small' | 'medium'
}

export default function DialogWrapper({ 
  title, 
  children, 
  className = "", 
  open,
  setOpen,
  trigger,
  defaultOpen = false,
  breakpoint = 'small'
}: DialogWrapperProps) {
  const isSmall = useMediaQuery(breakpoint == 'small' ? breakpoints.small : breakpoints.medium);
  
  // Internal state for uncontrolled mode
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  
  // Determine if component is in controlled or uncontrolled mode
  const isControlled = open !== undefined && setOpen !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const onOpenChange = isControlled 
    ? setOpen 
    : setInternalOpen;

  if (isSmall) {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
        <DrawerContent className="max-h-[85vh]">
          <div className={cn("pb-3 px-3", className)}>
            <DrawerHeader className="pt-6">
              <DrawerTitle className={
                cn(
                  title && 'p-0 m-0'
                )
              }>{title}</DrawerTitle>
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
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle className={
            cn(
              title && 'p-0 m-0'
            )
          }>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}