'use client'

import SubtitleFileSelector from "@/app/watch/[id]/[ep]/_components/subtitle-file-selector";
import { usePlayerStore } from "@/lib/stores/player-store";
import { parseSubtitleToJson } from "@/lib/subtitle/parse";
import { timestampToSeconds } from "@/lib/subtitle/utils";
import { getExtension } from "@/lib/utils";
import { SubtitleFormat } from "@/types/subtitle";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

export default function Playground() {

  const subtitles = useMemo(() => {
    return [
      {
        "url": "https://jimaku.cc/entry/2184/download/%E5%83%95%E3%81%A0%E3%81%91%E3%81%8C%E3%81%84%E3%81%AA%E3%81%84%E8%A1%97.S01E03.%E7%97%A3.WEBRip.Netflix.ja%5Bcc%5D.srt",
        "name": "僕だけがいない街.S01E03.痣.WEBRip.Netflix.ja[cc].srt",
        "size": 25104,
        "last_modified": "2024-06-18T19:08:02.078498194Z"
      },
      {
        "url": "https://jimaku.cc/entry/2184/download/%5BAC%5D%20Boku%20dake%20ga%20Inai%20Machi%20-%2003%20%5B720p%5D%5BLucifer22%5D%5BCrunchyroll%20Timed%5D.ja.srt",
        "name": "[AC] Boku dake ga Inai Machi - 03 [720p][Lucifer22][Crunchyroll Timed].ja.srt",
        "size": 23190,
        "last_modified": "2024-06-18T19:43:31.229106079Z"
      },
      {
        "url": "https://jimaku.cc/entry/2184/download/%5BAirota%5D%20%E5%83%95%E3%81%A0%E3%81%91%E3%81%8C%E3%81%84%E3%81%AA%E3%81%84%E8%A1%97%2003%20(BDrip%201920x1080%20AVC-YUV420P10%20FLAC).srt",
        "name": "[Airota] 僕だけがいない街 03 (BDrip 1920x1080 AVC-YUV420P10 FLAC).srt",
        "size": 23202,
        "last_modified": "2024-06-18T19:24:34.924384341Z"
      },
      {
        "url": "https://jimaku.cc/entry/2184/download/%5BAC%5D%20Boku%20dake%20ga%20Inai%20Machi%20-%2003%20%5B720p%5D%5BLucifer22%5D.ja-en.ass",
        "name": "[AC] Boku dake ga Inai Machi - 03 [720p][Lucifer22].ja-en.ass",
        "size": 61585,
        "last_modified": "2024-06-18T19:41:58.89400908Z"
      },
      {
        "url": "https://jimaku.cc/entry/2184/download/%5BKamigami%5D%20Boku%20dake%20ga%20Inai%20Machi%20Japanese%20-%2003%20%5BHorribleSubs%20Timed%5D.ass",
        "name": "[Kamigami] Boku dake ga Inai Machi Japanese - 03 [HorribleSubs Timed].ass",
        "size": 35913,
        "last_modified": "2024-06-18T19:39:47.507285197Z"
      },
      {
        "url": "https://jimaku.cc/entry/2184/download/Boku%20dake%20ga%20Inai%20Machi%20-%20E03%20-%20%5BTV%5D.srt",
        "name": "Boku dake ga Inai Machi - E03 - [TV].srt",
        "size": 24549,
        "last_modified": "2024-03-03T12:06:16Z"
      }
    ]
  }, [])

  const activeSubtitleFile = usePlayerStore((state) => state.activeSubtitleFile)
  const setActiveSubtitleFile = usePlayerStore((state) => state.setActiveSubtitleFile)

  useEffect(() => {
    setActiveSubtitleFile({
    source: "remote",
    file: {
      name: "僕だけがいない街.S01E03.痣.WEBRip.Netflix.ja[cc].srt",
      url: "https://jimaku.cc/entry/2184/download/%E5%83%95%E3%81%A0%E3%81%91%E3%81%8C%E3%81%84%E3%81%AA%E3%81%84%E8%A1%97.S01E03.%E7%97%A3.WEBRip.Netflix.ja%5Bcc%5D.srt",
      last_modified: "2024-06-18T19:08:02.078498194Z",
      size: 25104
    }
  })
  }, [setActiveSubtitleFile])

  const { data } = useQuery({
    queryKey: ['.ass', activeSubtitleFile],
    queryFn: async () => {
      if(!activeSubtitleFile || activeSubtitleFile.source != 'remote') return

      const data = await parseSubtitleToJson({
        format: getExtension(activeSubtitleFile.file.name) as SubtitleFormat,
        source: activeSubtitleFile.file.url,
        transcription: 'japanese'
      })

      return data
    },
    enabled: !!activeSubtitleFile
  })

  useEffect(() => {
    if(!data?.length) return;

    const arr = data.map((cue) => {
      const startTime = timestampToSeconds({ timestamp: cue.from, delay: 0 });
      const endTime = timestampToSeconds({ timestamp: cue.to, delay: 0 });

      console.log(`${startTime}-${endTime}`)
      // console.log(`${cue.from}-${cue.to}`)
    })

    console.log(`arr`, arr)
  }, [data])

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <SubtitleFileSelector
        subtitleFiles={subtitles}
      />
    </div>
  );
}