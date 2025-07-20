import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { AnilistResponse } from "@/types/anilist"
import { useRef, useState } from "react"
import AutoPlay from "embla-carousel-autoplay"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { animeQueries } from "@/lib/queries/anime"
import { Anime } from "@/types/anime"
import TopTrendingSkeleton from "@/components/home/top-trending/skeleton"
import TopTrendingSlide from "@/components/home/top-trending/slide"

export default function TopTrending() {
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const plugin = useRef(
    AutoPlay({ delay: 5000, stopOnInteraction: true })
  );

  const { 
    data, 
    isLoading, 
    error,
  }: UseQueryResult<AnilistResponse<"Page", { media: Anime[] }>, Error> = useQuery({
    ...animeQueries.topTrending(),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 48 * 60 * 60 * 1000,
    retry: 3,
  });

  if (isLoading || error) return <TopTrendingSkeleton />;

  return (
    <Carousel 
      plugins={[plugin.current]}
      className="relative"
    >
      <CarouselContent>
        {data?.Page.media
          .filter((anime) => anime.bannerImage)
          .map((anime) => (
            <TopTrendingSlide
              key={anime.id}
              anime={anime}
              imageLoading={imageLoading}
              setImageLoading={setImageLoading}
            />
          ))
        }
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-4 lg:top-1/2 -translate-y-1 lg:-translate-y-1/2 z-10" />
      <CarouselNext className="absolute right-4 top-4 lg:top-1/2 -translate-y-1 lg:-translate-y-1/2 z-10" />
    </Carousel>
  );
}