'use client'

import AnimeDataPlayground from "@/app/playground/_components/anime-data";
import DefinitionPlayground from "@/app/playground/_components/defintion";
import DefinitionPlayerPlayground from "@/app/playground/_components/defintion-player";
import PlayerPanelPlayground from "@/app/playground/_components/player-panel";
import PrefetchPlayground from "@/app/playground/_components/prefetch";
import ProgressivePitch from "@/app/playground/_components/progressive-pitch";
import SettingsDialogPlayground from "@/app/playground/_components/settings-dialog";
import TestPlayground from "@/app/playground/_components/test";
import TokenizerPlayground from "@/app/playground/_components/tokenizer";
import TransHook from "@/app/playground/_components/trans-hook";
import TranscriptionsPlayground from "@/app/playground/_components/transcriptions";
import TranscriptionsCachePlayground from "@/app/playground/_components/transcriptions-cache";
import TranscriptionsWordsPlayground from "@/app/playground/_components/transcriptions-words";

export default function Playground() {
  return (
    <>
      {/* <DefinitionPlayerPlayground /> */}
      {/* <DefinitionPlayground /> */}
      {/* <PrefetchPlayground /> */}
      <ProgressivePitch />
      {/* <TranscriptionsWordsPlayground /> */}
      {/* <TranscriptionsPlayground /> */}
      {/* <DelayPlayground /> */}
      {/* <SettingsDialogPlayground /> */}
      {/* <PlayerPanelPlayground /> */}
      {/* <TestPlayground /> */}
      {/* <TranscriptionsPlayground /> */}
      {/* <TokenizerPlayground /> */}
      {/* <TransHook /> */}
      {/* <AnimeDataPlayground /> */}
    </>
  );
}