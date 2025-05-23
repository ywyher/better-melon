import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { SubtitleCue as TSubtitleCue, SubtitleTranscription, SubtitleFormat } from "@/types/subtitle";
import { useVirtualizer } from "@tanstack/react-virtual";
import { usePlayerStore } from "@/lib/stores/player-store";
import SubtitleCuesContainer from "@/app/watch/[id]/[ep]/_components/panel/subtitle-cues-container";

type SubtitleCuesListProps = {
    isLoading: boolean;
    selectedTranscription: SubtitleTranscription;
    cues: TSubtitleCue[]
}

export default function SubtitleCuesList({
    selectedTranscription,
    isLoading,
    cues
}: SubtitleCuesListProps) {

  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  
  const activeCueIdRef = useRef<number>(-1);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  
  const player = usePlayerStore((state) => state.player);
  const delay = usePlayerStore((state) => state.delay);
  const activeSubtitleFile = usePlayerStore((state) => state.activeSubtitleFile);

  const cueTimeRanges = useMemo(() => {
      if (!cues?.length) return [];
      
      return cues.map(cue => ({
          id: cue.id,
          index: cues.indexOf(cue),
          start: cue.from + delay.japanese,
          end: cue.to + delay.japanese
      }));
  }, [cues, activeSubtitleFile?.file.name, delay.japanese]);

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
      const activeCue = cueTimeRanges.find(cue => 
        currentTime >= cue.start && currentTime <= cue.end
      );
      
      if (activeCue) {
          if (activeCue.id !== activeCueIdRef.current) {
              activeCueIdRef.current = activeCue.id;
              
              if (activeCue.index !== activeIndex) {
                  setActiveIndex(activeCue.index);
                  
                  if (autoScroll) {
                      rowVirtualizer.scrollToIndex(activeCue.index, { 
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
  }, [cueTimeRanges, activeIndex, activeCueIdRef, autoScroll, rowVirtualizer]);

  useEffect(() => {
      if(!player.current || !cues?.length || !cueTimeRanges.length) return;

      return player.current.subscribe(({ currentTime }) => {
          const now = Date.now();
          if (now - lastUpdateTimeRef.current > 250) {
              lastUpdateTimeRef.current = now;
              findActiveCue(currentTime);
          }
      });
  }, [player, cues, cueTimeRanges, findActiveCue]);

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
            />
          </TabsContent>
      </div>
  )
}