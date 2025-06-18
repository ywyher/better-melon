'use client'

import DefinitionPlayground from "@/app/playground/_components/defintion";
import PlayerPanelPlayground from "@/app/playground/_components/player-panel";
import ProgressivePitch from "@/app/playground/_components/progressive-pitch";
import SettingsDialogPlayground from "@/app/playground/_components/settings-dialog";
import TranscriptionsPlayground from "@/app/playground/_components/transcriptions-cache";
import TranscriptionsWordsPlayground from "@/app/playground/_components/transcriptions-words";

export default function Playground() {
  return (
    <>
      {/* <ProgressivePitch /> */}
      {/* <TranscriptionsWordsPlayground /> */}
      {/* <TranscriptionsPlayground /> */}
      {/* <DefinitionPlayground /> */}
      {/* <DelayPlayground /> */}
      {/* <SettingsDialogPlayground /> */}
      <PlayerPanelPlayground />
    </>
  );
}