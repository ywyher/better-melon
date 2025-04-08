import React, { Dispatch, SetStateAction } from "react";
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
import { useIsMedium, useIsSmall } from "@/hooks/useMediaQuery";

type DialogWrapperProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  trigger?: React.ReactNode; // Optional trigger element
}

export default function DialogWrapper({ 
  title, 
  children, 
  className = "", 
  open, 
  onOpenChange,
  trigger
}: DialogWrapperProps) {
  const isMedium = useIsSmall();

  if (isMedium) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
        <DrawerContent className={`
          pb-3
          px-3
          ${className}
        `}>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          {children}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}