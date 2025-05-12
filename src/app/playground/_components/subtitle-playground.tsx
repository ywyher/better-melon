'use client'

import { getSession } from "@/lib/auth-client";
import { User } from "@/lib/db/schema";
import { useSubtitleTranscriptions } from "@/lib/queries/subtitle";
import { userQueries } from "@/lib/queries/user";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function SubtitlePlayground() {

  // const { data: user } = useQuery({
  //   queryKey: ['session'], 
  //   queryFn: async () => {
  //     const start = performance.now()
  //     const data = await getSession()
  //     const end = performance.now()
  //     console.info(`~fetch session took: ${(end - start).toFixed(2)}ms`)
  //     return data.data?.user as User || null
  //   }
  // })

  // Set up the initial state for the player store
  const setActiveSubtitleFile = usePlayerStore((state) => state.setActiveSubtitleFile);
  const setActiveTranscriptions = usePlayerStore((state) => state.setActiveTranscriptions);
  const setEnglishSubtitleUrl = usePlayerStore((state) => state.setEnglishSubtitleUrl);


  useEffect(() => {
    // Set the initial data in the player store
    // setEnglishSubtitleUrl("https://s.megastatics.com/subtitle/92580649ff01096b4a0de6428f58bedb/eng-0.vtt");
    // setActiveTranscriptions(['english', 'japanese']);
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
  }, [setEnglishSubtitleUrl, setActiveTranscriptions, setActiveSubtitleFile]); // Add dependencies

  const subtitleQueries = useSubtitleTranscriptions()

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
    </div>
  );
}
