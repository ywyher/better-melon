import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  value: string | number;
  label: string;
  icon?: LucideIcon;
  className?: string;
}

export default function StatsCard({ 
  value, 
  label, 
  icon: Icon,
  className = '' 
}: StatsCardProps) {
  return (
    <div className={cn(
      "flex flex-col items-center gap-1",
      "rounded-lg",
      "w-fit",
      className
    )}>
      {/* Main value */}
      <div className="text-2xl font-bold tracking-tight">{value}</div>

      {/* Header with optional icon */}
      <div className="flex flex-row-reverse items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {Icon && <div className="text-muted-foreground"><Icon size={18} /></div>}
      </div>
    </div>
  )
}

export function StatsCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <Skeleton className="w-4 h-4" /> {/* Skeleton for icon */}
        <Skeleton className="h-6 w-8" /> {/* Skeleton for the number */}
      </div>
      <Skeleton className="h-3 w-16" /> {/* Skeleton for label */}
    </div>
  )
}