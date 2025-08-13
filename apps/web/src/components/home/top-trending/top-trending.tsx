import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useRef, useState } from "react"
import AutoPlay from "embla-carousel-autoplay"
import TopTrendingSkeleton from "@/components/home/top-trending/skeleton"
import TopTrendingSlide from "@/components/home/top-trending/slide"
import { useAnimeList } from "@/lib/hooks/use-anime-list"
import { queryVariables } from "@/lib/constants/anime"
import { AnimeTopTrending } from "@/types/anime"

export default function TopTrending() {
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const plugin = useRef(
    AutoPlay({ delay: 5000, stopOnInteraction: true })
  );

  const { data, isLoading, error } = useAnimeList<AnimeTopTrending[]>({
    name: "topTrending",
    variables: queryVariables.list.topTrending({})
  })

  if (isLoading || error) return <TopTrendingSkeleton />;

  return (
    <Carousel 
      plugins={[plugin.current]}
      className="relative"
    >
      <CarouselContent>
        {data && data.Page.media
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