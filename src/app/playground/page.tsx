'use client'

import { defaultPlayerSettings } from "@/app/settings/player/constants";
import EnabledTranscriptions from "@/app/watch/[id]/[ep]/_components/settings/enabled-transcriptions";

export default function Playground() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <EnabledTranscriptions
        playerSettings={defaultPlayerSettings}
        syncPlayerSettings="always"
      />
    </div>
  );
}