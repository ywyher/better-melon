import { DetailsTab } from "@/components/info/details/tabs"
import { cn } from "@/lib/utils/utils"
import { TabsTrigger } from "@radix-ui/react-tabs"
import { LucideIcon } from "lucide-react"

type DetailsTabTriggerProps = {
  index: number
  name: string
  icon: LucideIcon
  activeTab: DetailsTab
  className?: string
}

export default function DetailsTabTrigger({ index, name, icon, activeTab, className = "" }: DetailsTabTriggerProps) {
  const isActive = name == activeTab;
  const Icon = icon;

  return (
    <TabsTrigger
      value={name}
      className={cn(
        'flex flex-row gap-2 items-center',
        'bg-transparent border-b-2 border-b-transparent',
        'px-5 py-3 transition-all',
        'text-muted-foreground capitalize cursor-pointer',
        isActive && "border-b-primary bg-black/40",
        index == 0 && "rounded-tl-xl", 
        className,
      )}
    >
      <Icon
        size={16}
        className={isActive ? "text-white" : undefined}
      />
      {name}
    </TabsTrigger>
  )
}