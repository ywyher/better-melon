'use client'

import SubtitleFileSelector from "@/app/watch/[id]/[ep]/_components/subtitle-file-selector";
import LocalFileSelector from "@/components/local-file-selector";

const files = [
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
]

export default function Playground() {
  return (
    <div className="relative w-screen h-screen">
      <SubtitleFileSelector subtitleFiles={files} />
    </div>
  );
}