import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { SubtitleCue as TSubtitleCue, SubtitleTranscription, SubtitleFormat } from "@/types/subtitle";
import { useVirtualizer } from "@tanstack/react-virtual";
import { usePlayerStore } from "@/lib/stores/player-store";
import SubtitleCuesContainer from "@/app/watch/[id]/[ep]/_components/panel/subtitle-cues-container";
import { TranscriptionsLookup } from "@/app/watch/[id]/[ep]/types";
import { useDelayStore } from "@/lib/stores/delay-store";

type SubtitleCuesListProps = {
    isLoading: boolean;
    selectedTranscription: SubtitleTranscription;
    cues: TSubtitleCue[];
    transcriptionsLookup: TranscriptionsLookup
}

export default function SubtitleCuesList({
    selectedTranscription,
    isLoading,
    cues,
    transcriptionsLookup
}: SubtitleCuesListProps) {
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  
  const activeCueIdRef = useRef<number>(-1);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  
  const player = usePlayerStore((state) => state.player);
  const delay = useDelayStore((state) => state.delay);;

  const rowVirtualizer = useVirtualizer({
      count: cues?.length || 0,
      getScrollElement: () => scrollAreaRef.current,
      estimateSize: () => 60,
      overscan: 5,
      measureElement: (element: Element) => {
        return element.getBoundingClientRect().height || 60;
      },
  });

  const findActiveCue = useCallback((currentTime: number) => {
      if (!cues?.length) return;
      
      const activeCueIndex = cues.findIndex(cue => 
        currentTime >= (cue.from + delay.japanese) && currentTime <= (cue.to + delay.japanese)
      );
      
      if (activeCueIndex !== -1) {
          const activeCue = cues[activeCueIndex];
          
          if (activeCue.id !== activeCueIdRef.current) {
              activeCueIdRef.current = activeCue.id;
              
              if (activeCueIndex !== activeIndex) {
                  setActiveIndex(activeCueIndex);
                  
                  if (autoScroll) {
                      rowVirtualizer.scrollToIndex(activeCueIndex, { 
                          align: 'center',
                          behavior: 'smooth'
                      });
                  }
              }
          }
      } else if (activeCueIdRef.current !== -1) {
          activeCueIdRef.current = -1;
          setActiveIndex(-1);
      }
  }, [cues, delay.japanese, activeIndex, activeCueIdRef, autoScroll, rowVirtualizer]);

  useEffect(() => {
      if(!player.current || !cues?.length) return;

      return player.current.subscribe(({ currentTime }) => {
          const now = Date.now();
          if (now - lastUpdateTimeRef.current > 250) {
              lastUpdateTimeRef.current = now;
              findActiveCue(currentTime);
          }
      });
  }, [player, cues, findActiveCue]);

  const handleManualScroll = useCallback(() => {
      setAutoScroll(false);
      
      if (autoScrollTimerRef.current) {
          clearTimeout(autoScrollTimerRef.current);
      }
      
      autoScrollTimerRef.current = setTimeout(() => {
          setAutoScroll(true);
      }, 5000);
  }, []);
    
  return (
      <div 
          ref={scrollAreaRef} 
          className="overflow-y-auto h-[80vh] w-full"
          style={{
              opacity: isLoading ? 0.8 : 1,
          }}
          onScroll={handleManualScroll}
      >
          <TabsContent 
              value={selectedTranscription}
              className="relative w-full"
              style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  position: 'relative',
              }}
          >   
            <SubtitleCuesContainer 
              items={rowVirtualizer}
              activeCueIdRef={activeCueIdRef}
              cues={cues}
              transcriptionsLookup={transcriptionsLookup}
            />
          </TabsContent>
      </div>
  )
}