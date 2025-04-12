import BottombarLinks from "@/components/sidebar/bottombar-links"
import { cn } from "@/lib/utils"

type SidebarProps = {
  className?: string
}

export default function Bottombar({
  className = ""
}: SidebarProps) {
  return (
    <div className={cn(
        "bg-[#0E0E0E] border-e border-s border-e-secondary",
        "fixed bottom-0 left-0 right-0 z-40",
        className
    )}>
      <BottombarLinks />
    </div>
  )
}