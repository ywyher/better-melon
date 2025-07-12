'use client'

import DefinitionPlayground from "@/app/playground/_components/definition";
import PanelPlayground from "@/app/playground/_components/panel";
import RubyPlayground from "@/app/playground/_components/ruby";
import SubtitleFileSelectorPlayground from "@/app/playground/_components/subtitle-file-selector";
import TranscriptionsPlayground from "@/app/playground/_components/transcriptions";
import TranscriptionsHookPlayground from "@/app/playground/_components/transcriptions-hook";

export default function Playground() {
  return (
    <>
      {/* <RubyPlayground /> */}
      {/* <SubtitleFileSelectorPlayground /> */}
      {/* <DefinitionPlayground /> */}
      <PanelPlayground />
      {/* <TranscriptionsPlayground /> */}
      {/* <TranscriptionsHookPlayground /> */}
    </>
  );
}