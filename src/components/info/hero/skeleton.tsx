import { ImageSkeleton } from "@/components/image-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function HeroSkeleton() {
  return (
    <div className="relative w-full min-h-[800px] lg:min-h-[500px]">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-background/50 to-background/50 backdrop-blur-xs z-[3] rounded-xl" />
      <ImageSkeleton className="rounded-xl" />
      <Skeleton className="w-full h-full rounded-xl" />
      
      {/* Content */}
      <div className="absolute inset-0 z-10 flex flex-col lg:flex-row justify-between items-center px-10 py-10 lg:py-0">
        <div className="flex flex-col gap-5 items-center lg:items-start">
          {/* Stats */}
          <div className="flex gap-2">
            {[16, 20, 16, 16].map((width, i) => (
              <Skeleton key={i} className={`h-6 w-${width}`} />
            ))}
          </div>
          
          {/* Title */}
          <div className="space-y-2">
            <Skeleton className="h-12 w-80" />
          </div>
          
          {/* Genres */}
          <div className="flex gap-2">
            {[16, 20, 14, 18, 16].map((width, i) => (
              <Skeleton key={i} className={`h-8 w-${width}`} />
            ))}
          </div>
          
          {/* Button */}
          <Skeleton className="h-10 w-32" />
        </div>
        
        {/* Cover image */}
        <div className="relative h-[400px] w-[280px]">
          <Skeleton className="w-full h-full rounded-lg" />
          <div className="absolute bottom-5 left-5 flex gap-3">
            <div className="flex flex-col gap-2 items-center">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-6 w-8" />
            </div>
            <div className="flex flex-col gap-2 items-center">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-6 w-8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}