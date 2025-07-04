import { Virtualizer } from "@tanstack/react-virtual";
import { SubtitleToken, SubtitleCue as TSubtitleCue } from "@/types/subtitle";
import SubtitleCue from "@/app/watch/[id]/[ep]/_components/panel/subtitle-cue";
import { RefObject, useCallback } from "react";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useDefinitionStore } from "@/lib/stores/definition-store";
import { getSentencesForCue, isTokenExcluded } from "@/lib/utils/subtitle";
import { toast } from "sonner";
import { useDelayStore } from "@/lib/stores/delay-store";
import { useSubtitleStore } from "@/lib/stores/subtitle-store";
import { useWatchDataStore } from "@/lib/stores/watch-store";

export default function SubtitleCuesContainer({
  items,
  cues,
  activeCueIdRef,
}: {
  items: Virtualizer<HTMLDivElement, Element>
  cues: TSubtitleCue[];
  activeCueIdRef: RefObject<number>
}) {
  const player = usePlayerStore((state) => state.player)
  const delay = useDelayStore((state) => state.delay);
  const activeSubtitleFile = useSubtitleStore((state) => state.activeSubtitleFile)

  const transcriptionsLookup = useWatchDataStore((state) => state.transcriptionsLookup)
  
  const activeToken = useDefinitionStore((state) => state.token)
  const setSentences = useDefinitionStore((state) => state.setSentences)
  const setToken = useDefinitionStore((state) => state.setToken)
  const setIsAddToAnki = useDefinitionStore((state) => state.setIsAddToAnki)
    
  const handleSeek = useCallback((from: TSubtitleCue['from']) => {
    player.current?.remoteControl.seek(from + delay.japanese)
  }, [player, activeSubtitleFile, delay.japanese]);

  const handleClick = useCallback((token: SubtitleToken, from: number, to: number) => {
    if (
      !token
      || !transcriptionsLookup
      || isTokenExcluded(token)
    ) return;
    
    if (activeToken && activeToken.id === token.id) {
      // If clicking on the same token, clear it and the sentence
      setToken(null);
      setSentences({
        kanji: null,
        kana: null,
        english: null,
      });
    } else {
      // Otherwise set the new token and get sentences for all transcriptions
      setToken(token);
      const sentences = getSentencesForCue(transcriptionsLookup, from, to, delay);
      setSentences(sentences);
    }
    
    setIsAddToAnki(false);
  }, [activeToken, setToken, setSentences, setIsAddToAnki, getSentencesForCue]);

  const handleCopy = useCallback(async (sentence: string) => {
      if(!sentence) return;
      try {
        await navigator.clipboard.writeText(sentence)
        toast.success("Cue copied to clipboard")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : `Failed to copy cue`)
      }
  }, []);

  return (
    <>
      {items.getVirtualItems().map((row) => {
          const cue = cues[row.index];
          if (!cue) return null;
          
          return (
            <SubtitleCue
              key={`${row.key}-${cue.id}`}
              cue={cue} 
              index={row.index}
              isActive={activeCueIdRef.current === cue.id}
              size={row.size}
              start={row.start}
              activeToken={activeToken}
              handleSeek={handleSeek}
              handleCopy={handleCopy}
              handleClick={handleClick}
            />
          );
      })}
    </>
  )
}