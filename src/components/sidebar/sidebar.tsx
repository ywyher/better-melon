import SidebarLinks from "@/components/sidebar/sidebar-links"
import { cn } from "@/lib/utils"

type SidebarProps = {
  className?: string
}

export default function Sidebar({
  className = ""
}: SidebarProps) {
  return (
    <div className={cn(
        "bg-[#0E0E0E] border-e border-s border-e-secondary",
        // Mobile: fixed bottom navbar
        "fixed bottom-0 left-0 right-0 z-40",
        // Desktop: sticky sidebar with height
        "md:fixed md:top-[var(--header-height)] md:left-0 md:h-[calc(100vh-[var(--header-height)])] md:w-[var(--sidebar-width)]",
        className
    )}>
      <SidebarLinks />
    </div>
  )
}