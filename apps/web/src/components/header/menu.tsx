"use client";

import { useRouter } from "next/navigation";
import {
  LogOut,
  Settings,
  UserIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import Pfp from "@/components/pfp";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Menu({ isSmall }: { isSmall: boolean }) {
  const [open, setOpen] = useState<boolean>(false)
  const router = useRouter();
  const queryClient = useQueryClient()

  const handleLogout = async () => {
    const { error } = await authClient.signOut()
    
    if(error) {
      toast.error(error.message)
      return;
    }

    queryClient.clear()
    router.refresh()
    setOpen(false)
  }

  if (isSmall)
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger>
          <Pfp className="min-w-10 max-w-10 min-h-10 max-h-10 rounded-sm" />
        </SheetTrigger>
        <SheetContent className="flex flex-col gap-5 px-4 pb-4 w-[80%]">
          <SheetHeader className="h-1">
            <SheetTitle>
              おかえり
            </SheetTitle>
          </SheetHeader>
          <Separator />
          <div className="flex flex-col gap-4">
            <Link href="/profile" className="flex flex-row gap-2">
                <UserIcon size={20} />
                <span>Profile</span>
            </Link>
            <Link href="/settings" className="flex flex-row gap-2">
                <Settings size={20} />
                <span>Settings</span>
            </Link>
          </div>
          <div className="flex items-end h-full">
              <Button className="w-full" onClick={() => handleLogout()}>
                <LogOut />
                Logout
              </Button>
          </div>
        </SheetContent>
      </Sheet>
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer">
        <Pfp className="min-w-10 max-w-10 min-h-10 max-h-10 rounded-sm" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44">
        <DropdownMenuLabel className="capitalize">
            おかえり
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push("/profile")}
          >
            <UserIcon />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push("/settings")}
          >
            <Settings />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => handleLogout()}
          >
            <LogOut />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}