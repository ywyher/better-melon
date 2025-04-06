import AccordionSkeleton from "@/components/accordion-skeleton"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

// Settings skeleton component
interface SettingsSkeletonProps {
  withAccordion?: boolean
}

export default function SettingsSkeleton({ 
  withAccordion = false,
}: SettingsSkeletonProps) {
  const SettingsContent = () => (
    <div className="flex flex-col gap-5 animate-pulse">
      {/* Scripts selector and toggle buttons */}
      <div className="flex flex-row gap-2">
        <Skeleton className="h-10 w-full flex-1 rounded-md" />
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
      
      <Separator />
      
      {/* Delay slider */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="h-5 w-full rounded-full" />
      </div>
      
      <Separator />
      
      {/* Navigation controls */}
      <div className="flex flex-row gap-2 w-full justify-between items-center">
        <div className="flex flex-col gap-2 w-full flex-1">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        
        <Separator orientation="vertical" className="h-20" />
        
        <div className="flex flex-col gap-2 w-full flex-1">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
    </div>
  )

  if (withAccordion) {
    return (
      <AccordionSkeleton />
    )
  }

  return <SettingsContent />
}