import { Virtualizer } from "@tanstack/react-virtual";
import { SubtitleFormat, SubtitleToken, SubtitleCue as TSubtitleCue } from "@/types/subtitle";
import SubtitleCue from "@/app/watch/[id]/[ep]/_components/panel/subtitle-cue";
import { RefObject, useCallback } from "react";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useDefinitionStore } from "@/lib/stores/definition-store";
import { getExtension } from "@/lib/utils";
import { timestampToSeconds } from "@/lib/subtitle/utils";
import { toast } from "sonner";

export default function SubtitleCuesContainer({
  items,
  cues,
  activeCueIdRef
}: {
  items: Virtualizer<HTMLDivElement, Element>
  cues: TSubtitleCue[];
  activeCueIdRef: RefObject<number>
}) {
  const player = usePlayerStore((state) => state.player)
  const delay = usePlayerStore((state) => state.delay)
  const activeSubtitleFile = usePlayerStore((state) => state.activeSubtitleFile)
  
  const activeToken = useDefinitionStore((state) => state.token)
  const setSentence = useDefinitionStore((state) => state.setSentence)
  const setToken = useDefinitionStore((state) => state.setToken)
  const setAddToAnki = useDefinitionStore((state) => state.setAddToAnki)
    
  const handleSeek = useCallback((from: TSubtitleCue['from']) => {
      player.current?.remoteControl.seek(timestampToSeconds({
          timestamp: (from),
          format: getExtension(activeSubtitleFile?.file.name || "srt") as SubtitleFormat,
          delay: delay.japanese
      }))
  }, [player, activeSubtitleFile, delay.japanese]);

  const handleClick = useCallback((sentence: string, token: SubtitleToken) => {
    if (!sentence || !token) return;
    
    if (activeToken && activeToken.id === token.id) {
      // If clicking on the same token, clear it and the sentence
      setToken(null);
      setSentence(null);
    } else {
      // Otherwise set the new token and sentence
      setToken(token);
      setSentence(sentence);
    }
    
    setAddToAnki(false);
  }, [activeToken, setToken, setSentence, setAddToAnki]);

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