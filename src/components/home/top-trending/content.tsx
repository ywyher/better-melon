import TopTrendingActionButtons from "@/components/home/top-trending/action-buttons";
import { removeHtmlTags } from "@/lib/utils/subtitle";
import { Anime } from "@/types/anime";

export default function TopTrendingContent({ anime }: { anime: Anime }) {
  return (
    <div className="absolute inset-0 flex items-end z-[4]">
      <div className="p-4 sm:p-6 lg:p-10 lg:px-14 space-y-3 sm:space-y-4 max-w-2xl">
        <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow hover:bg-primary/80 bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm">
          {anime.format}
        </div>
        
        <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold">
          {anime.title.english}
        </h2>
        
        <p className="text-xs sm:text-sm lg:text-base text-muted-foreground line-clamp-2 lg:line-clamp-3">
          {removeHtmlTags(anime.description || "")}
        </p>
        
        <TopTrendingActionButtons animeId={anime.id} />
      </div>
    </div>
  );
}