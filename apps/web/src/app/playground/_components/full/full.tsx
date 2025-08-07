import useFullPlayground from "@/app/playground/_components/full/use-full-playground"
import EpisodeDetails from "@/app/watch/[id]/[ep]/components/episode/details/details";
import SubtitlePanel from "@/app/watch/[id]/[ep]/components/panel/panel";
import ControlsSection from "@/app/watch/[id]/[ep]/components/sections/controls-section";
import PlayerSection from "@/app/watch/[id]/[ep]/components/sections/player-section";
import { cn } from "@/lib/utils/utils";

export default function FullPlayground() {
  useFullPlayground()

  return (
    <div className="grid grid-cols-14 gap-8 pb-20">
      <div className={cn(
        "flex flex-col gap-3 w-full",
        'col-span-9',
      )}>
        {/* Top controls and player area */}
        <PlayerSection />
        {/* Settings below player */}
        <ControlsSection />
        {/* Episode Data Section */}
        <EpisodeDetails />
      </div>
      {/* Side panel (visible based on state) */}
      <div className={cn(
        "flex flex-col gap-5 col-span-5",
      )}>
        <SubtitlePanel />
        {/* {isLoading ? (
          <EpisodesList 
            nextAiringEpisode={streaming.data?.anime.nextAiringEpisode}
            animeTitle={streaming.data?.anime.title}
            animeBanner={streaming.data?.anime.bannerImage}
            isLoading={isLoading}
          />
        ): (
          <>
            {shouldShowPanel && (
              <EpisodesList 
                nextAiringEpisode={streaming.data?.anime.nextAiringEpisode}
                animeTitle={streaming.data?.anime.title}
                animeBanner={streaming.data?.anime.bannerImage}
              />
            )}
          </>
        )} */}
      </div>
    </div>
  )
}