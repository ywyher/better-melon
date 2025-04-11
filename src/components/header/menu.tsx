"use client";

import { useRouter } from "next/navigation";
import {
  LogOut,
  Settings,
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
import { useIsMedium } from "@/hooks/useMediaQuery";
import Pfp from "@/components/pfp";
import Link from "next/link";
import { User } from "@/lib/db/schema";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export function Menu({ user, isSmall }: { user: User, isSmall: boolean }) {
  const router = useRouter();
  const queryClient = useQueryClient()
  const isMedium = useIsMedium()

  const handleLogout = async () => {
    const { error } = await authClient.signOut()
    
    if(error) {
      toast.error(error.message)
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['session'] })
    router.push('/')
  }

  if (isMedium)
    return (
      <Sheet>
        <SheetTrigger>
          <Pfp />
        </SheetTrigger>
        <SheetContent className="flex flex-col gap-5 w-[300px]">
          <SheetHeader className="h-1">
            <SheetTitle>
              お帰り
            </SheetTitle>
          </SheetHeader>
          <Separator />
          <div className="flex flex-col gap-4 px-4">
            <Link href="/profile/settings" className="flex flex-row gap-2">
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
        <Pfp />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44">
        <DropdownMenuLabel className="capitalize">
            おかえり
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push("/profile/settings")}
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