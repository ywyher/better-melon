'use client';

import { useParams } from 'next/navigation';
import { Indicator } from '@/components/indicator';
import { usePlayerStore } from '@/lib/stores/player-store';
import { useIsMedium } from '@/hooks/use-media-query';
import { useEpisodeData } from '@/lib/hooks/use-epsiode-data';
import { useAnimeData } from '@/lib/hooks/use-anime-data';
import PlayerSection from '@/app/watch/[id]/[ep]/_components/sections/player-section';
import ControlsSection from '@/app/watch/[id]/[ep]/_components/sections/controls-section';
import PanelSection from '@/app/watch/[id]/[ep]/_components/sections/panel-section';
import { usePrefetchNextEpisode } from '@/lib/hooks/use-prefetch-next-episode';

export default function WatchPage() {
  const params = useParams();
  const animeId = params.id as string;
  const episodeNumber = Number(params.ep as string);
  const isMedium = useIsMedium();
  const panelState = usePlayerStore((state) => state.panelState);
  
  const { animeData, isLoadingAnime, animeError } = useAnimeData(animeId);
  
  const { 
    episodeContext, 
    isLoading: isLoadingData, 
    error: dataError,
    loadingDuration,
    episodesLength
  } = useEpisodeData(animeId, episodeNumber);


  usePrefetchNextEpisode(animeId, episodeNumber, episodesLength);

  const errors = [animeError, dataError].filter(Boolean);
  if (errors.length > 0) {
    return <Indicator type='error' message={errors[0]?.message || "An error occurred"} />;
  }
  
  return (
    <div className="flex flex-col md:flex-row w-full md:gap-10">
      <div className="flex flex-col gap-3 w-full">
        {/* Top controls and player area */}
        <PlayerSection
          animeId={animeId}
          episodeNumber={episodeNumber}
          isLoading={isLoadingData || !episodeContext || !episodeContext.metadata}
          loadingDuration={loadingDuration}
          episodeContext={episodeContext}
          episodesLength={episodesLength}
          isMedium={isMedium}
        />
        
        {/* Settings below player */}
        <ControlsSection
          isLoading={isLoadingData || !episodeContext}
          episodeContext={episodeContext}
          episodesLength={episodesLength}
        />
      </div>
      
      {/* Side panel (visible based on state) */}
      {(!isMedium && panelState === 'visable') && (
        <PanelSection
          isLoading={isLoadingData || !episodeContext}
          isLoadingAnime={isLoadingAnime}
          animeData={animeData}
          episodeContext={episodeContext}
        />
      )}
    </div>
  );
}