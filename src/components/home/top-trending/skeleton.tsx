import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Skeleton } from "@/components/ui/skeleton"

export default function TopTrendingSkeleton() {
  // Generate array of skeleton items (typically 5-10 items for carousel)
  const skeletonItems = Array.from({ length: 8 }, (_, i) => i)

  return (
    <Carousel className="relative">
      <CarouselContent>
        {skeletonItems.map((index) => (
          <CarouselItem key={index} className="relative">
            <div className="relative w-full h-72 lg:h-[500px]">
              {/* Banner image skeleton */}
              <Skeleton className="w-full h-full rounded-lg" />
              
              {/* Gradient overlay (static) */}
              <div 
                className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent z-[3]"
              />
              
              {/* Content skeleton */}
              <div className="absolute inset-0 flex items-end z-[4]">
                <div className="p-4 sm:p-6 lg:p-10 space-y-3 sm:space-y-4 max-w-2xl">
                  {/* Format badge skeleton */}
                  <Skeleton className="h-6 w-16 rounded-md" />
                  
                  {/* Title skeleton */}
                  <div className="space-y-2">
                    <Skeleton className="h-6 sm:h-8 lg:h-10 w-3/4" />
                    <Skeleton className="h-6 sm:h-8 lg:h-10 w-1/2 lg:hidden" />
                  </div>
                  
                  {/* Description skeleton */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 sm:h-5 lg:h-6 w-full" />
                    <Skeleton className="h-4 sm:h-5 lg:h-6 w-5/6" />
                    <Skeleton className="h-4 sm:h-5 lg:h-6 w-3/4 hidden lg:block" />
                  </div>
                  
                  {/* Button skeleton */}
                  <div className="flex flex-col lg:flex-row gap-3">
                    <Skeleton className="h-10 w-full lg:w-32" />
                    <Skeleton className="h-10 w-full lg:w-32" />
                  </div>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10" />
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10" />
    </Carousel>
  )
}