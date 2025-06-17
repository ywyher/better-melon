import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { SubtitleCue as TSubtitleCue, SubtitleTranscription, SubtitleFormat } from "@/types/subtitle";
import { useVirtualizer } from "@tanstack/react-virtual";
import { usePlayerStore } from "@/lib/stores/player-store";
import SubtitleCuesContainer from "@/app/watch/[id]/[ep]/_components/panel/subtitle-cues-container";
import { PitchLookup, TranscriptionsLookup, WordsLookup } from "@/app/watch/[id]/[ep]/types";
import { useDelayStore } from "@/lib/stores/delay-store";
import { PlayerSettings, WordSettings } from "@/lib/db/schema";

type SubtitleCuesListProps = {
  isLoading: boolean;
  selectedTranscription: SubtitleTranscription;
  cues: TSubtitleCue[];
  transcriptionsLookup: TranscriptionsLookup
  autoScrollToCue: PlayerSettings['autoScrollToCue']
  autoScrollResumeDelay: PlayerSettings['autoScrollResumeDelay'] // Updated name
  pitchLookup: PitchLookup
  wordsLookup: WordsLookup
  learningStatus: WordSettings['learningStatus']
  pitchColoring: WordSettings['pitchColoring']
}

export default function SubtitleCuesList({
  selectedTranscription,
  isLoading,
  cues,
  transcriptionsLookup,
  autoScrollToCue,
  autoScrollResumeDelay,
  pitchLookup,
  wordsLookup,
  learningStatus,
  pitchColoring
}: SubtitleCuesListProps) {
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [autoScroll, setAutoScroll] = useState<boolean>(autoScrollToCue); // Use setting
  
  const activeCueIdRef = useRef<number>(-1);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  
  const player = usePlayerStore((state) => state.player);
  const delay = useDelayStore((state) => state.delay);

  useEffect(() => {
    setAutoScroll(autoScrollToCue);
  }, [autoScrollToCue]);

  useEffect(() => {
    rowVirtualizer.measure()
  }, [selectedTranscription])

  // Dynamic size estimation based on transcription type
  const estimateSize = useCallback((index: number) => {
    const cue = cues?.[index];
    if (!cue) return 60;
    
    // Furigana needs more space for stacked text
    if (selectedTranscription === 'furigana') {
      return 95; // Increased height for furigana
    }
    
    // Check if the content is particularly long and might wrap
    const contentLength = cue.content?.length || 0;
    if (contentLength > 50) {
      return 80; // Extra space for long content that might wrap
    }
    
    return 60; // Default size
  }, [cues, selectedTranscription]);

  const rowVirtualizer = useVirtualizer({
      count: cues?.length || 0,
      getScrollElement: () => scrollAreaRef.current,
      estimateSize: estimateSize,
      overscan: 5,
      measureElement: (element: Element) => {
        return element.getBoundingClientRect().height || 60;
      },
  });

  const findActiveCue = useCallback((currentTime: number) => {
      if (!cues?.length || !autoScrollToCue) return; // Check setting
      
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
  }, [cues, delay.japanese, activeIndex, activeCueIdRef, autoScroll, rowVirtualizer, autoScrollToCue]);

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
    if (!autoScrollToCue) return
    
    setAutoScroll(false);
    
    if (autoScrollTimerRef.current) {
        clearTimeout(autoScrollTimerRef.current);
    }
    
    // Use the setting value or fallback to 5000ms
    const delayMs = (autoScrollResumeDelay || 5) * 1000;
    
    autoScrollTimerRef.current = setTimeout(() => {
        setAutoScroll(true);
    }, delayMs);
  }, [autoScrollToCue, autoScrollResumeDelay]);

  useEffect(() => {
    return () => {
      if (autoScrollTimerRef.current) {
        clearTimeout(autoScrollTimerRef.current);
      }
    };
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
              pitchLookup={pitchLookup}
              wordsLookup={wordsLookup}
              learningStatus={learningStatus}
              pitchColoring={pitchColoring}
            />
          </TabsContent>
      </div>
  )
}