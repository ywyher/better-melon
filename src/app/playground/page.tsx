'use client'

import DefinitionPlayground from "@/app/playground/_components/definition";
import IsTranscriptionsCachedPlayground from "@/app/playground/_components/is-transcriptions-cached";
import PanelPlayground from "@/app/playground/_components/panel";
import ProgressivePitchPlayground from "@/app/playground/_components/progressive-pitch";
import ProxyPlayground from "@/app/playground/_components/proxy";
import RubyPlayground from "@/app/playground/_components/ruby";
import SubtitleFileSelectorPlayground from "@/app/playground/_components/subtitle-file-selector";
import TranscriptionsPlayground from "@/app/playground/_components/transcriptions";
import TranscriptionsHookPlayground from "@/app/playground/_components/transcriptions-hook";
import WatchDataPlayground from "@/app/playground/_components/watch-data";
import { defaultPlayerSettings } from "@/app/settings/player/constants";
import EnabledTranscriptions from "@/app/watch/[id]/[ep]/_components/settings/enabled-transcriptions";

export default function Playground() {
  return (
    <>
      <EnabledTranscriptions
        playerSettings={defaultPlayerSettings}
        syncSettings="never"
      />
      {/* <IsTranscriptionsCachedPlayground /> */}
      {/* <ProgressivePitchPlayground /> */}
      {/* <WatchDataPlayground /> */}
      {/* <TranscriptionsHookPlayground /> */}
      {/* <TranscriptionsPlayground /> */}
      {/* <ProxyPlayground /> */}
      {/* <RubyPlayground /> */}
      {/* <SubtitleFileSelectorPlayground /> */}
      {/* <DefinitionPlayground /> */}
      {/* <PanelPlayground /> */}
    </>
  );
}