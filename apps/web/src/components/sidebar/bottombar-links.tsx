"use client"

import { cn } from "@/lib/utils/utils"
import { Home, LucideProps, Settings, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Search from "@/components/header/search/search"
import { ForwardRefExoticComponent, RefAttributes } from "react"

type Link = {
  label: string;
  href: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
}

export default function BottombarLinks() {
  const pathname = usePathname()
  
  const linksPart1 = [
    { label: "home", href: "/", icon: Home },
  ] as Link[]
  
  const linksPart2 = [
    { label: "profile", href: "/profile", icon: User },
    { label: "settings", href: "/profile/settings", icon: Settings },
  ] as Link[]
  
  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    
    if (href === "/profile" && pathname === "/profile") {
      return true
    }
    
    return pathname === href
  }
  
  const renderLink = (l: Link, idx: number, isFirstSection: boolean) => {
    const isActive = isLinkActive(l.href)
    const adjustedIdx = isFirstSection ? idx : idx + linksPart1.length + 1;
    
    return (
      <Link
        href={l.href}
        key={idx}
        className={cn(
          "flex-1 md:w-full",
          "flex flex-col gap-1 items-center justify-center",
          "py-2 pt-3 md:pt-4 md:pb-3",
          "hover:bg-muted/50 cursor-pointer transition-all",
          "text-gray-600 dark:text-gray-400 hover:text-foreground",
          adjustedIdx % 2 === 0 && "md:bg-secondary/30",
          isActive && "text-foreground"
        )}
      >
        <l.icon className={cn(isActive && "text-primary")} />
        <p className={cn("text-sm capitalize", isActive && "text-primary")}>{l.label}</p>
      </Link>
    )
  }
  
  return (
    <div className="w-full flex flex-row md:flex-col">
      {/* First part of the links */}
      {linksPart1.map((l, idx) => renderLink(l, idx, true))}
      
      <Search className={cn(
          "w-full h-full",
          "flex-1 md:w-full",
          "flex flex-col gap-1 items-center justify-center",
          "py-2 pt-3 md:pt-4 md:pb-3",
          "hover:bg-muted/50 cursor-pointer transition-all",
          "text-gray-600 dark:text-gray-400 hover:text-foreground",
      )} />
      
      {/* Second part of the links */}
      {linksPart2.map((l, idx) => renderLink(l, idx, false))}
    </div>
  )
}