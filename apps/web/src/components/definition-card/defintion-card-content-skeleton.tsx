import { JMdictSkeleton } from "@/components/definition-card/_sections/jmdict/skeleton";
import { JMnedictSkeleton } from "@/components/definition-card/_sections/jmnedict/skeleton";
import { Kanjidic2Skeleton } from "@/components/definition-card/_sections/kanjidic2/skeleton";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

// Combined Dictionary Content Skeleton
export function DefinitionCardContentSkeleton({ isExpanded }: { isExpanded: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      {isExpanded ? (
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:gap-4">
          <div className="col-span-8">
            <JMdictSkeleton />
          </div>
          <div className="col-span-4 sm:border-t-2 sm:pt-5 lg:pt-0 lg:border-none">
            <div className="flex flex-col gap-4">
              <Kanjidic2Skeleton />
              <Separator />
              <JMnedictSkeleton />
            </div>
          </div>
        </div>
      ) : (
        <Skeleton className="h-5 w-32" /> // {/* Simple loading for collapsed view */}
      )}
    </div>
  )
}