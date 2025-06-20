import BottombarLinks from "@/components/sidebar/bottombar-links"
import { cn } from "@/lib/utils/utils"

type SidebarProps = {
  className?: string
}

export default function Bottombar({
  className = ""
}: SidebarProps) {
  return (
    <div className={cn(
        "bg-black/80 backdrop-blur-sm border-e border-s border-e-secondary",
        "fixed bottom-0 left-0 right-0 z-40",
        "h-[calc(var(--bottombar-height))]",
        className
    )}>
      <BottombarLinks />
    </div>
  )
}