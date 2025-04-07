"use client";

import { useRouter } from "next/navigation";
import {
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

export function Menu() {
  const router = useRouter();
  const isMedium = useIsMedium()

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
            お帰り
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
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}