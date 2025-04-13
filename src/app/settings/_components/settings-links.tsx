"use client"

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SettingsLinks() {
  const pathname = usePathname()
  const links = [
    { label: "General", href: '/settings' },
    { label: "Anki", href: '/settings/anki' },
  ]

  const isLinkActive = (href: string) => {
    if (href === "/settings" && pathname === "/settings") {
      return true
    }
    return pathname === href
  }

  return (
    <div className="flex flex-row gap-2 pb-1">
      {links.map((l, idx) => {
        const isActive = isLinkActive(l.href)
        return (
          <Link
            key={idx}
            href={l.href}
            className={cn(
              "pb-1 transition-all",
              isActive 
                ? "border-b-2 border-neutral-800 dark:border-neutral-200" 
                : "border-b-2 border-transparent hover:border-neutral-400 dark:hover:border-neutral-500"
            )}
          >
            <Button
              variant='ghost'
              className={cn(
                "text-sm font-bold px-3 py-1 h-auto",
                isActive 
                  ? "text-neutral-800 dark:text-neutral-100" 
                  : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              )}
            >
              {l.label}
            </Button>
          </Link>
        )
      })}
    </div>
  )
}