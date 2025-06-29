'use client'

import { defaultPlayerSettings } from "@/app/settings/player/constants";
import PanelSection from "@/app/watch/[id]/[ep]/_components/sections/panel-section";
import EnabledTranscriptions from "@/app/watch/[id]/[ep]/_components/settings/enabled-transcriptions";
import SubtitleTranscriptions from "@/app/watch/[id]/[ep]/_components/transcriptions/transcriptions";
import DefinitionCard from "@/components/definition-card/definition-card";
import LocalFileSelector from "@/components/local-file-selector";
import { Button } from "@/components/ui/button";
import { useSubtitleStyles } from "@/lib/hooks/use-subtitle-styles";
import { useSubtitleTranscriptions } from "@/lib/hooks/use-subtitle-transcriptions";
import { useSubtitleStore } from "@/lib/stores/subtitle-store";
import { AnimeEpisodeMetadata } from "@/types/anime";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

export default function TranscriptionsPlayground() {
  const setActiveSubtitleFile = useSubtitleStore((state) => state.setActiveSubtitleFile);
  const setActiveTranscriptions = useSubtitleStore((state) => state.setActiveTranscriptions);
  const activeSubtitleFile = useSubtitleStore((state) => state.activeSubtitleFile);
  const setEnglishSubtitleUrl = useSubtitleStore((state) => state.setEnglishSubtitleUrl);
  
  useEffect(() => {
    setEnglishSubtitleUrl("https://s.megastatics.com/subtitle/92580649ff01096b4a0de6428f58bedb/eng-0.vtt");
    // setActiveTranscriptions(['japanese']);
    // setActiveTranscriptions(['japanese', 'hiragana']);
    // setActiveTranscriptions(['japanese', 'english']);
    // setActiveTranscriptions(['english']);
    setActiveTranscriptions(['japanese', 'hiragana', 'english']);
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

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['delete-cachhe'],
    mutationFn: async () => {
      const response = await fetch('/api/subtitles/parse', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  })
  
  const { transcriptions, transcriptionsLookup, refetch, isLoading } = useSubtitleTranscriptions()
  const { styles } = useSubtitleStyles();

  const shouldShowPanel = useMemo(() => {
    return transcriptions && 
      transcriptions.find(t => t?.transcription === 'japanese') ? true : false
  }, [transcriptions]);

  return (
    <div>
      <div className="flex flex-row justify-between gap-10">
        <div className="flex flex-col gap-3">
          <EnabledTranscriptions
            playerSettings={defaultPlayerSettings}
            syncPlayerSettings={'never'}
          />
          <LocalFileSelector />
          <Button 
            className="w-full" 
            variant="destructive"
            onClick={() => mutateAsync()}
            disabled={isPending}
          >
            Delete cache
          </Button>
          <Button 
            className="w-full" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Refetch
          </Button>
        </div>
        {shouldShowPanel && (
          <PanelSection
            isLoading={isLoading}
            animeMetadata={{
              image: ''
            } as AnimeEpisodeMetadata}
            transcriptions={transcriptions}
            transcriptionsLookup={transcriptionsLookup}
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
      <DefinitionCard />
      <SubtitleTranscriptions
        transcriptions={transcriptions}
        styles={styles}
        syncPlayerSettings={'always'}
        cuePauseDuration={0}
        definitionTrigger={'click'}
        transcriptionsLookup={transcriptionsLookup}
      />
    </div>
  );
}