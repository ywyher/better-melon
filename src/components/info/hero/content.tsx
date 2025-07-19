import InfoHeroCoverImage from "@/components/info/hero/cover-image";
import InfoHeroGenreTags from "@/components/info/hero/genre-tags";
import { HeroProps } from "@/components/info/hero/hero";
import InfoHeroStatsBar from "@/components/info/hero/stats";
import { InfoHeroWatchButton } from "@/components/info/hero/watch-button";

export function InfoHeroContent({ id, title, seasonYear, genres, episodes, averageScore, format, coverImage, duration }: Omit<Omit<HeroProps, 'bannerImage'>, 'isLoading'>) {
  return (
    <div className="
      absolute inset-0 z-10
      flex justify-between items-center
      px-10
    ">
      <div className="flex flex-col gap-5">
        <InfoHeroStatsBar
          averageScore={averageScore} 
          seasonYear={seasonYear} 
          format={format} 
          episodes={episodes} 
        />
        
        <div
          className="
            text-5xl font-bold
            rounded-md pr-4 py-1
            hover:bg-primary/30 hover:pl-4 transition-all
          "
        >
          {title.english}
        </div>
        
        <InfoHeroGenreTags genres={genres} />
        
        <InfoHeroWatchButton id={id} />
      </div>
      
      <InfoHeroCoverImage
        coverImage={coverImage}
        title={title}
        episodes={episodes}
        duration={duration}
      />
    </div>
  );
}