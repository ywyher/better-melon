import GoBack from '@/components/goback';
import Player from "../player/player";
import PlayerSkeleton from "../player/player-skeleton";
import { usePlayerStore } from '@/lib/stores/player-store';
import { TopControls } from '@/app/watch/[id]/[ep]/_components/sections/top-controls';
import { AnimeEpisodeContext } from '@/types/anime';
import { TranscriptionQuery, TranscriptionStyles } from '@/app/watch/[id]/[ep]/types';
import { SubtitleCue } from '@/types/subtitle';

interface PlayerSectionProps {
  animeId: string;
  episodeNumber: number;
  isLoading: boolean;
  loadingDuration: number;
  episodeContext?: AnimeEpisodeContext;
  episodesLength: number;
  isMedium: boolean;
  transcriptions: TranscriptionQuery[]
  transcriptionsStyles: TranscriptionStyles
}

export default function PlayerSection({
  animeId,
  episodeNumber,
  isLoading,
  loadingDuration,
  episodeContext,
  episodesLength,
  isMedium,
  transcriptions,
  transcriptionsStyles,
}: PlayerSectionProps) {
  const panelState = usePlayerStore((state) => state.panelState);
  const setPanelState = usePlayerStore((state) => state.setPanelState);

  return (
    <>
      <div className="flex items-center justify-between w-full">
        <GoBack />
        <TopControls 
          isLoading={isLoading}
          loadingDuration={loadingDuration}
          episodeContext={episodeContext}
          isMedium={isMedium}
          panelState={panelState}
          setPanelState={setPanelState}
          japaneseTranscriptions={transcriptions.find(t => t?.transcription == 'japanese')?.cues}
        />
      </div>
      
      <div className="relative w-full lg:aspect-video">
        {isLoading ? (
          <PlayerSkeleton isLoading={true} />
        ) : (
          <>
            {episodeContext && (
              <>
                <Player
                  animeId={animeId}
                  episodeNumber={episodeNumber}
                  metadata={episodeContext.metadata}
                  streamingLinks={episodeContext.data.streamingLinks}
                  episodesLength={episodeContext.data.details.episodes} 
                  syncPlayerSettings={episodeContext.generalSettings.syncPlayerSettings}
                  transcriptions={transcriptions}
                  transcriptionsStyles={transcriptionsStyles}
                  />
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}