// In SubtitleCuesContainer.tsx
import { memo } from 'react';
import { Virtualizer } from "@tanstack/react-virtual";
import { SubtitleFormat, SubtitleToken, SubtitleCue as TSubtitleCue } from "@/types/subtitle";
import SubtitleCue from "@/app/watch/[id]/[ep]/_components/panel/subtitle-cue";
import { RefObject, useCallback } from "react";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useDefinitionStore } from "@/lib/stores/definition-store";
import { getExtension } from "@/lib/utils";
import { timestampToSeconds } from "@/lib/subtitle";

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
  const setSentance = useDefinitionStore((state) => state.setSentance)
  const setToken = useDefinitionStore((state) => state.setToken)
    
  const handleSeek = useCallback((from: TSubtitleCue['from']) => {
      player.current?.remoteControl.seek(timestampToSeconds({
          timestamp: (from) + delay.japanese,
          format: getExtension(activeSubtitleFile?.file.name || "srt") as SubtitleFormat
      }))
  }, [player, activeSubtitleFile, delay.japanese]);

  const handleClick = useCallback((sentance: string, token: SubtitleToken) => {
      if(!sentance || !token) return;
      setSentance(sentance)
      setToken(token)
  }, [setSentance, setToken]);

  const getItemStyle = useCallback((start: number, size: number) => ({
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: `${size}px`,
    transform: `translateY(${start}px)`,
  }), []);

  return (
    <>
      {items.getVirtualItems().map((row) => {
          const cue = cues[row.index];
          const style = getItemStyle(row.start, row.size);
          
          return (
              <SubtitleCue
                  key={row.key}
                  cue={cue} 
                  index={row.index}
                  isActive={activeCueIdRef.current === cue.id}
                  style={style}
                  activeToken={activeToken}
                  handleSeek={handleSeek}
                  handleClick={handleClick}
              />
          );
      })}
    </>
  )
}