import EpisodesListSkeleton from '@/app/watch/[id]/[ep]/_components/episodes/episodes-list-skeleton';
import SubtitlePanel from '../panel/panel';
import PanelSkeleton from '../panel/panel-skeleton';
import { AnimeEpisodeMetadata } from '@/types/anime';
import { SubtitleFile } from '@/types/subtitle';
import EpisodesList from '@/app/watch/[id]/[ep]/_components/episodes/episodes-list';
import { PitchLookup, TranscriptionQuery, TranscriptionsLookup, WordsLookup } from '@/app/watch/[id]/[ep]/types';
import { useEffect } from 'react';
import { PlayerSettings, WordSettings } from '@/lib/db/schema';

interface PanelSectionProps {
  isLoading: boolean;
  animeMetadata: AnimeEpisodeMetadata;
  subtitleFiles?: SubtitleFile[];
  transcriptions?: TranscriptionQuery[];
  transcriptionsLookup?: TranscriptionsLookup
  autoScrollToCue: PlayerSettings['autoScrollToCue']
  autoScrollResumeDelay: PlayerSettings['autoScrollResumeDelay']
  pitchLookup: PitchLookup
  wordsLookup: WordsLookup
  learningStatus: WordSettings['learningStatus']
  pitchColoring: WordSettings['pitchColoring']
}

export default function PanelSection({
  isLoading,
  animeMetadata,
  subtitleFiles,
  transcriptions,
  transcriptionsLookup,
  autoScrollToCue,
  autoScrollResumeDelay,
  pitchLookup,
  wordsLookup,
  learningStatus,
  pitchColoring,
}: PanelSectionProps) {
  return (
    <div className="flex flex-col gap-5 w-full md:w-auto">
      {isLoading ? (
        <PanelSkeleton />
      ) : (
        <>
          {(transcriptions && subtitleFiles && transcriptionsLookup) && (
            <SubtitlePanel
              subtitleFiles={subtitleFiles}
              transcriptions={transcriptions}
              transcriptionsLookup={transcriptionsLookup}
              autoScrollToCue={autoScrollToCue}
              autoScrollResumeDelay={autoScrollResumeDelay}
              pitchLookup={pitchLookup}
              wordsLookup={wordsLookup}
              learningStatus={learningStatus}
              pitchColoring={pitchColoring}
            />
          )}
        </>
      )}
    {/*       
      {(isLoading || !animeMetadata) ? (
        <EpisodesListSkeleton />
      ) : (
        <EpisodesList
          episodesMetadata={animeMetadata} 
        />
      )} */}
    </div>
  );
}