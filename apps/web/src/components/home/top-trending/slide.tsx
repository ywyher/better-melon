import TopTrendingBackground from "@/components/home/top-trending/background";
import TopTrendingContent from "@/components/home/top-trending/content";
import { CarouselItem } from "@/components/ui/carousel";
import { AnimeTopTrending } from "@/types/anime";

export default function TopTrendingSlide({ 
  anime, 
  imageLoading, 
  setImageLoading 
}: { 
  anime: AnimeTopTrending;
  imageLoading: boolean;
  setImageLoading: (loading: boolean) => void;
}) {
  return (
    <CarouselItem key={anime.id} className="relative">
      <div className="relative w-full h-80 lg:h-[500px]">
        <TopTrendingBackground
          bannerImage={anime.bannerImage || ""}
          title={anime.title.english || "Anime Banner"}
          imageLoading={imageLoading}
          setImageLoading={setImageLoading}
        />
        <TopTrendingContent anime={anime} />
      </div>
    </CarouselItem>
  );
}