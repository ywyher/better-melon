'use client'

import SubtitleTranscriptions from "@/app/watch/[id]/[ep]/_components/transcriptions/transcriptions";
import DefinitionCard from "@/components/definition-card/definition-card";
import { useSubtitleStyles } from "@/lib/hooks/use-subtitle-styles";
import { useSubtitleTranscriptions } from "@/lib/hooks/use-subtitle-transcriptions";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useEffect, useMemo, useRef } from "react";
import { MediaPlayer, MediaPlayerInstance, MediaProvider } from '@vidstack/react';
import { DefaultAudioLayout, defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import PanelSection from "@/app/watch/[id]/[ep]/_components/sections/panel-section";
import { AnimeEpisodeMetadata } from "@/types/anime";
import { useSettingsForEpisode } from "@/lib/hooks/use-settings-for-episode";
import { useSubtitleStore } from "@/lib/stores/subtitle-store";
import { useWatchDataStore } from "@/lib/stores/watch-store";
import { useActiveSubtitles } from "@/lib/hooks/use-active-subtitles";
import { hasChanged } from "@/lib/utils/utils";
import { usePitchAccentChunks } from "@/lib/hooks/use-pitch-accent-chunks";
import { useWords } from "@/lib/hooks/use-words";

export default function TranscriptionsPlayground() {
  const player = useRef<MediaPlayerInstance>(null);
  const setActiveSubtitleFile = useSubtitleStore((state) => state.setActiveSubtitleFile);
  const setActiveTranscriptions = useSubtitleStore((state) => state.setActiveTranscriptions);
  const setEnglishSubtitleUrl = useSubtitleStore((state) => state.setEnglishSubtitleUrl);
  const setPlayer = usePlayerStore((state) => state.setPlayer)

  useEffect(() => {
    setPlayer(player)
  }, [setPlayer]);

  useEffect(() => {
    setActiveTranscriptions(['japanese']);
    setActiveSubtitleFile({
      file: {
        last_modified: "2024-04-28T16:23:56.084911647Z",
        name: "[Judas] Steins;Gate - S01E02.srt",
        size: 36924,
        url: "https://jimaku.cc/entry/1323/download/%5BMoozzi2%5D%20Made%20in%20Abyss%20-%2009%20(BD%201920x1080%20x.264%20Flac).ass"
      },
      source: 'remote'
    });
  }, [setEnglishSubtitleUrl, setActiveTranscriptions, setActiveSubtitleFile]);
  
  const { transcriptions, transcriptionsLookup } = useSubtitleTranscriptions()
  const { activeSubtitles } = useActiveSubtitles(transcriptions)
  const { styles } = useSubtitleStyles();
  const { pitchLookup } = usePitchAccentChunks()
  const { wordsLookup } = useWords()
  
  const store = useWatchDataStore.getState(); // use this to read current store values (won't trigger re-renders)
  const {
    setTranscriptions,
    setStyles,
    setPitchLookup,
    setWordsLookup,
    setTranscriptionsLookup,
    setActiveSubtitles,
  } = useWatchDataStore()

  useEffect(() => {
    if (transcriptions && hasChanged(transcriptions, store.transcriptions)) {
      setTranscriptions(transcriptions);
    }
  }, [transcriptions]);

  useEffect(() => {
    if (transcriptionsLookup && hasChanged(transcriptionsLookup, store.transcriptionsLookup)) {
      setTranscriptionsLookup(transcriptionsLookup);
    }
  }, [transcriptionsLookup]);

  useEffect(() => {
    if (styles && hasChanged(styles, store.styles)) {
      setStyles(styles);
    }
  }, [styles]);

  useEffect(() => {
    if (activeSubtitles && hasChanged(activeSubtitles, store.activeSubtitles)) {
      setActiveSubtitles(activeSubtitles);
    }
  }, [activeSubtitles]);

  useEffect(() => {
    if (pitchLookup && hasChanged(pitchLookup, store.pitchLookup)) {
      setPitchLookup(pitchLookup);
    }
  }, [pitchLookup]);

  useEffect(() => {
    if (wordsLookup && hasChanged(wordsLookup, store.wordsLookup)) {
      setWordsLookup(wordsLookup);
    }
  }, [wordsLookup]);

  const url = `https://www.youtube.com/watch?v=LF7AezBpqzg`

  return (
    <div className="flex flex-row gap-10">
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
          <SubtitleTranscriptions />
      </MediaPlayer>
    </div>
  );
}