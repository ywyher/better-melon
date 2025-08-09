import HeroCoverImage from "@/components/info/hero/cover-image";
import GenreTags from "@/components/genre-tags";
import HeroStatsBar from "@/components/info/hero/stats";
import { HeroWatchButton } from "@/components/info/hero/watch-button";
import { AnimeInfoHero } from "@/types/anime";
import AddToList from "@/components/add-to-list/add-to-list";

export function HeroContent({ anime }: { anime: AnimeInfoHero }) {
  return (
    <div className="
      absolute inset-0 z-10
      flex flex-col lg:flex-row justify-between items-center gap-10
      px-10 py-10 lg:py-0
    ">
      <div className="flex flex-col gap-5 items-center lg:items-start">
        <HeroStatsBar
          averageScore={anime.averageScore} 
          seasonYear={anime.seasonYear} 
          format={anime.format} 
          episodes={anime.episodes} 
        />
        
        <div
          className="
            text-5xl font-bold
            rounded-md pr-4 py-1
            hover:bg-primary/30 hover:pl-4 transition-all
          "
        >
          {anime.title.english}
        </div>
        
        <GenreTags genres={anime.genres} />
        
        <div className="flex flex-row gap-4">
          {anime.status != 'NOT_YET_RELEASED' && (
            <HeroWatchButton id={anime.id} />
          )}
          <AddToList
            animeId={anime.id}
            variant="secondary"
            className="
              w-fit !px-10 !py-5
              hover:scale-110 transition-all
              shadow-[0_0_10px_#000]
            "
          />
        </div>
      </div>
      
      <HeroCoverImage
        coverImage={anime.coverImage}
        title={anime.title}
        episodes={anime.episodes}
        duration={anime.duration}
      />
    </div>
  );
}