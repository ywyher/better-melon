'use client'

import SubtitleTranscriptions from "@/app/watch/[id]/[ep]/_components/transcriptions/transcriptions";
import DefinitionCard from "@/components/definition-card/definition-card";
import { useSubtitleStyles } from "@/lib/hooks/use-subtitle-styles";
import { useSubtitleTranscriptions } from "@/lib/hooks/use-subtitle-transcriptions";
import { useEffect, useMemo, useRef } from "react";
import { MediaPlayer, MediaPlayerInstance, MediaProvider } from '@vidstack/react';
import { DefaultAudioLayout, defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import { usePitchAccent } from "@/lib/hooks/use-pitch-accent";
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { useSubtitles } from "@/lib/hooks/use-subtitles";
import { useSubtitlesPitchAccent } from "@/lib/hooks/use-subtitles-pitch-accent";
import { useWords } from "@/lib/hooks/use-words";
import PanelSection from "@/app/watch/[id]/[ep]/_components/sections/panel-section";
import { AnimeEpisodeMetadata } from "@/types/anime";
import { usePitchAccentChunks } from "@/lib/hooks/use-pitch-accent-chunks";
import PitchLoadingIndicator from "@/app/playground/_components/pitch-loading";
import { Loader2 } from "lucide-react";
import { useActiveSubtitles } from "@/lib/hooks/use-active-subtitles";
import { useSubtitleStore } from "@/lib/stores/subtitle-store";
import { usePlayerStore } from "@/lib/stores/player-store";

export default function TranscriptionsWordsPlayground() {
  const player = useRef<MediaPlayerInstance>(null);
  const setPlayer = usePlayerStore((state) => state.setPlayer)
  const setActiveSubtitleFile = useSubtitleStore((state) => state.setActiveSubtitleFile);
  const setActiveTranscriptions = useSubtitleStore((state) => state.setActiveTranscriptions);

  useEffect(() => {
    setPlayer(player)
  }, [setPlayer]);
  
  useEffect(() => {
    setActiveTranscriptions(['japanese', 'hiragana']);
    setActiveSubtitleFile({
      file: {
        last_modified: "2024-04-28T16:23:56.084911647Z",
        name: "[Judas] Steins;Gate - S01E02.srt",
        size: 36924,
        url: "https://jimaku.cc/entry/1323/download/%5BMoozzi2%5D%20Made%20in%20Abyss%20-%2009%20(BD%201920x1080%20x.264%20Flac).ass"
      },
      source: 'remote'
    });
  }, [setActiveTranscriptions, setActiveSubtitleFile]);

  const { transcriptions, transcriptionsLookup, isLoading: isTranscriptionsLoading } = useSubtitleTranscriptions()
  const { styles } = useSubtitleStyles();
  const { activeSubtitles } = useActiveSubtitles(transcriptions)
  const { wordsLookup } = useWords()
  const { pitchLookup, isLoading: isPitchLoading, loadingDuration } = usePitchAccentChunks(transcriptions?.find(t => t.transcription == 'japanese')?.cues || [])

  const shouldShowPanel = useMemo(() => {
    return transcriptions 
    && transcriptions.find(t => t?.transcription === 'japanese') ? true : false
  }, [transcriptions]);

  const url = `https://www.youtube.com/watch?v=LF7AezBpqzg`

  return (
    <div className="flex flex-col justify-between gap-10">
      <div className="flex flex-row gap-5">
        {isTranscriptionsLoading && (
          <div className="flex flex-row gap-2">
            <Loader2 className="animate-spin" />
            <p>Transcriptions Loading</p>
          </div>
        )}
        {isPitchLoading && (
          <div className="flex flex-row gap-2">
          <Loader2 className="animate-spin" />
            <p>Pitch Loading</p>
          </div>
        )}
        {loadingDuration && <>Loading duration: {loadingDuration}</>}
      </div>
      <MediaPlayer
          title={""}
          ref={player}
          src={url}
          load='eager'
          posterLoad='eager'
          crossOrigin="anonymous"
          className='relative w-full h-fit'
          aspectRatio="16/9"
      >
        <MediaProvider>
        </MediaProvider>
        <DefaultAudioLayout icons={defaultLayoutIcons} />
        <DefaultVideoLayout
          icons={defaultLayoutIcons}
        />
        <DefinitionCard />
        <SubtitleTranscriptions
          activeSubtitles={activeSubtitles}
          styles={styles}
          syncPlayerSettings={'always'}
          cuePauseDuration={0}
          definitionTrigger={'click'}
          transcriptionsLookup={transcriptionsLookup}
          learningStatus={true}
          pitchColoring={true}
          pitchLookup={pitchLookup}
          wordsLookup={wordsLookup}
        />
      </MediaPlayer>
      {shouldShowPanel && (
        <PanelSection
          isLoading={isTranscriptionsLoading}
          autoScrollResumeDelay={3}
          autoScrollToCue={true}
          animeMetadata={{
            image: ''
          } as AnimeEpisodeMetadata}
          transcriptions={transcriptions}
          transcriptionsLookup={transcriptionsLookup}
          pitchLookup={pitchLookup}
          wordsLookup={wordsLookup}
          learningStatus={true}
          pitchColoring={true}
          subtitleFiles={[
            {
              "url": "https://jimaku.cc/entry/1323/download/%5BMoozzi2%5D%20Made%20in%20Abyss%20-%2009%20(BD%201920x1080%20x.264%20Flac).ass",
              "name": "[Moozzi2] Made in Abyss - 09 (BD 1920x1080 x.264 Flac).ass",
              "size": 21020,
              "last_modified": "2024-03-03T14:05:00Z"
            },
            {
              "url": "https://jimaku.cc/entry/1323/download/%E3%83%A1%E3%82%A4%E3%83%89%E3%82%A4%E3%83%B3%E3%82%A2%E3%83%93%E3%82%B9.S01E09.%E5%A4%A7%E6%96%AD%E5%B1%A4.WEBRip.Netflix.ja%5Bcc%5D.srt",
              "name": "メイドインアビス.S01E09.大断層.WEBRip.Netflix.ja[cc].srt",
              "size": 24331,
              "last_modified": "2024-11-25T19:50:45.147895847Z"
            }
          ]}  
        />
      )}
    </div>
  );
}