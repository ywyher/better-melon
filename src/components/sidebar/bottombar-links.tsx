"use client"

import { cn } from "@/lib/utils"
import { History, Home, Settings, TrendingDown, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function BottombarLinks() {
  const pathname = usePathname()
  
  const links = [
    { label: "home", href: "/", icon: Home },
    { label: "trending", href: "/trending", icon: TrendingDown },
    { label: "history", href: "/history", icon: History },
    { label: "profile", href: "/profile", icon: User },
    { label: "settings", href: "/profile/settings", icon: Settings },
  ]
  
  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    
    if (href === "/profile" && pathname === "/profile") {
      return true
    }
    
    return pathname === href
  }
  
  return (
    <div className="w-full flex flex-row md:flex-col">
      {links.map((l, idx) => {
        const isActive = isLinkActive(l.href)
        
        return (
          <Link
            href={l.href}
            key={idx}
            className={cn(
              "flex-1 md:w-full",
              "flex flex-col gap-1 items-center justify-center",
              "py-2 pt-3 md:pt-4 md:pb-3",
              "hover:bg-muted/50 cursor-pointer transition-all",
              ++idx % 2 === 1 && "md:bg-secondary/30",
              "text-gray-600 dark:text-gray-400 hover:text-foreground",
              // Apply active styles when the link is active
              isActive && "text-foreground"
            )}
          >
            <l.icon className={cn(isActive && "text-primary")} />
            <p className={cn("text-sm capitalize", isActive && "text-primary")}>{l.label}</p>
          </Link>
        )
      })}
    </div>
  )
}