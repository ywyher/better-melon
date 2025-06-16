import GoBack from '@/components/goback';
import Player from "../player/player";
import PlayerSkeleton from "../player/player-skeleton";
import { usePlayerStore } from '@/lib/stores/player-store';
import { TopControls } from '@/app/watch/[id]/[ep]/_components/sections/top-controls';
import { AnimeEpisodeData } from '@/types/anime';
import { PitchLookup, Subtitle, TranscriptionQuery, TranscriptionsLookup, TranscriptionStyles, WordsLookup } from '@/app/watch/[id]/[ep]/types';
import { SubtitleCue } from '@/types/subtitle';
import { SettingsForEpisode } from '@/types/settings';

interface PlayerSectionProps {
  animeId: string;
  episodeNumber: number;
  isLoading: boolean;
  loadingDuration: number;
  episodeData?: AnimeEpisodeData;
  episodesLength: number;
  isMedium: boolean;
  transcriptions: TranscriptionQuery[];
  transcriptionsStyles: TranscriptionStyles;
  settings: SettingsForEpisode
  transcriptionsLookup: TranscriptionsLookup
  wordsLookup: WordsLookup
  pitchLookup: PitchLookup
  activeSubtitles: Subtitle
}

export default function PlayerSection({
  animeId,
  episodeNumber,
  isLoading,
  loadingDuration,
  episodeData,
  episodesLength,
  isMedium,
  transcriptions,
  transcriptionsStyles,
  settings,
  transcriptionsLookup,
  wordsLookup,
  pitchLookup,
  activeSubtitles
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
          episodeData={episodeData}
          isMedium={isMedium}
          panelState={panelState}
          setPanelState={setPanelState}
          transcriptions={transcriptions}
          transcriptionsLookup={transcriptionsLookup}
          settings={settings}
        />
      </div>
      
      <div className="relative w-full lg:aspect-video">
        {isLoading ? (
          <PlayerSkeleton isLoading={true} />
        ) : (
          <>
            {episodeData && (
              <>
                <Player
                  animeId={animeId}
                  episodeNumber={episodeNumber}
                  metadata={episodeData.metadata}
                  streamingLinks={episodeData.streamingLinks}
                  episodesLength={episodeData.details.episodes} 
                  syncPlayerSettings={settings.generalSettings.syncPlayerSettings}
                  activeSubtitles={activeSubtitles}
                  transcriptionsStyles={transcriptionsStyles}
                  cuePauseDuration={settings.playerSettings.cuePauseDuration}
                  definitionTrigger={settings.subtitleSettings.definitionTrigger}
                  transcriptionsLookup={transcriptionsLookup}
                  wordsLookup={wordsLookup}
                  pitchLookup={pitchLookup}
                  pitchColoring={settings.wordSettings.pitchColoring}
                  learningStatus={settings.wordSettings.learningStatus}
                />
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}