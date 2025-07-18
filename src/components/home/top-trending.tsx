import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Info, Play } from "lucide-react"
import { removeHtmlTags } from "@/lib/utils/subtitle"
import { Skeleton } from "@/components/ui/skeleton"
import { AnilistResponse } from "@/types/anilist"
import { ImageSkeleton } from "@/components/image-skeleton"
import { useRef, useState } from "react"
import AutoPlay from "embla-carousel-autoplay"
import Link from "next/link"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { animeQueries } from "@/lib/queries/anime"
import { Anime } from "@/types/anime"

export default function TopTrending() {
  const [imageLoading, setImageLoading] = useState<boolean>(true)
  const plugin = useRef(
    AutoPlay({ delay: 5000, stopOnInteraction: true })
  )

  const { 
    data, 
    isLoading, 
    error,
  }: UseQueryResult<AnilistResponse<"Page", { media: Anime[] }>, Error> = useQuery({
    ...animeQueries.topTrending(),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 48 * 60 * 60 * 1000,
    retry: 3,
  })

  if(isLoading || error) return <TopTrendingSkeleton />

  return (
    <Carousel 
      plugins={[plugin.current]}
      className="relative"
    >
      <CarouselContent>
        {data?.Page.media.filter((a) => a.bannerImage).map((a) => (
          <CarouselItem key={a.id} className="relative">
            <div className="relative w-full h-80 lg:h-[500px]">
              {imageLoading && <ImageSkeleton />}
              <Image
                src={a.bannerImage || ""}
                alt={a.title.english || "Anime Banner"}
                fill
                loading="lazy"
                className="rounded-lg"
                onLoadingComplete={() => setImageLoading(false)}
              />
              <div 
                className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent z-[3]"
              />
              <div className="absolute inset-0 flex items-end z-[4]">
                <div className="p-4 sm:p-6 lg:p-10 lg:px-14 space-y-3 sm:space-y-4 max-w-2xl">
                  <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow hover:bg-primary/80 bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm">{a.format}</div>
                  <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold">{a.title.english}</h2>
                  <p className="text-xs sm:text-sm lg:text-base text-muted-foreground line-clamp-2 lg:line-clamp-3">
                    {removeHtmlTags(a.description || "")}
                  </p>
                  <div className="flex flex-col lg:flex-row gap-3">
                    <Button 
                      className="
                        flex flex-row items-center gap-2 !px-6
                        w-full lg:w-fit
                      "
                      asChild
                    >
                      <Link
                        href={`/watch/${a.id}/1`}
                      >
                        <Play />
                        Watch
                      </Link>
                    </Button>
                    <Button 
                      className="
                        flex flex-row items-center gap-2 !px-6
                        w-full lg:w-fit
                      "
                      variant="outline"
                      asChild
                    >
                      <Link
                        href={`/info/${a.id}`}
                      >
                        <Info />
                        Details
                      </Link>
                    </Button>
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

export function TopTrendingSkeleton() {
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