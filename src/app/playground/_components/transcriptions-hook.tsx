'use client'
import { useEpisodeData } from "@/lib/hooks/use-epsiode-data";
import { useSubtitleStyles } from "@/lib/hooks/use-subtitle-styles";
import { useSubtitleTranscriptions } from "@/lib/hooks/use-subtitle-transcriptions";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useEffect, useState } from "react";

export default function TranscriptionsHook() {
  const [totalLoadingTime, setTotalLoadingTime] = useState(0);
  const [loadingStartTime, setLoadingStartTime] = useState(0);
  
  const activeTranscriptions = usePlayerStore((state) => state.activeTranscriptions);
  const setActiveSubtitleFile = usePlayerStore((state) => state.setActiveSubtitleFile);
  const setActiveTranscriptions = usePlayerStore((state) => state.setActiveTranscriptions);
  const setEnglishSubtitleUrl = usePlayerStore((state) => state.setEnglishSubtitleUrl);
  
  // Start the timer when component mounts
  useEffect(() => {
    setLoadingStartTime(performance.now());
    
    // Set the initial data in the player store
    setEnglishSubtitleUrl("https://s.megastatics.com/subtitle/92580649ff01096b4a0de6428f58bedb/eng-0.vtt");
    setActiveTranscriptions(['japanese']);
    setActiveSubtitleFile({
      file: {
        last_modified: "2024-04-28T16:23:56.084911647Z",
        name: "[Judas] Steins;Gate - S01E02.srt",
        size: 36924,
        url: "https://jimaku.cc/entry/1310/download/%5BJudas%5D%20Steins%3BGate%20-%20S01E02.srt"
      },
      source: 'remote'
    });
  }, [setEnglishSubtitleUrl, setActiveTranscriptions, setActiveSubtitleFile]);
  
  const {
    episodeContext,
    isLoading: isEpisodeDataLoading,
    loadingDuration: episodeDataLoadingDuration
  } = useEpisodeData('21234', 3)
  
  const {
    transcriptions,
    isLoading: isTranscriptionsLoading,
    loadingDuration: transcriptionsLoadingDuration,
  } = useSubtitleTranscriptions();
  
  const {
    styles,
    isLoading: isStylesLoading,
    loadingDuration: stylesLoadingDuration
  } = useSubtitleStyles();
  
  // Calculate total loading time when all hooks have finished loading
  useEffect(() => {
    if (!isEpisodeDataLoading && !isTranscriptionsLoading && !isStylesLoading) {
      const endTime = performance.now();
      setTotalLoadingTime(Number((endTime - loadingStartTime).toFixed(2)));
    }
  }, [isEpisodeDataLoading, isTranscriptionsLoading, isStylesLoading, loadingStartTime]);

  useEffect(() => {
    console.debug({
      episodeContext,
      isEpisodeDataLoading,
      episodeDataLoadingDuration
    })
  }, [episodeContext, isEpisodeDataLoading, episodeDataLoadingDuration])
  
  useEffect(() => {
    console.debug({
      transcriptions,
      isTranscriptionsLoading,
      transcriptionsLoadingDuration
    })
  }, [transcriptions, isTranscriptionsLoading, transcriptionsLoadingDuration])
  
  useEffect(() => {
    console.debug({
      styles,
      isStylesLoading,
      stylesLoadingDuration
    })
  }, [styles, isStylesLoading, stylesLoadingDuration])
  
  return (
    <div>
      {(isTranscriptionsLoading || isEpisodeDataLoading || isStylesLoading) ? (
        <>Loading</>
      ): (
        <div className="flex flex-col gap-3">
          <p>Transcriptions: {transcriptionsLoadingDuration}ms</p>
          <p>Styles: {stylesLoadingDuration}ms</p>
          <p>Episode Data: {episodeDataLoadingDuration}ms</p>
          <p className="font-bold">Total Loading Time: {totalLoadingTime}ms</p>
        </div>
      )}
    </div>
  )
}