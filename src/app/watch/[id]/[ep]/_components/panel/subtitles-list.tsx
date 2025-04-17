import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import SubtitleCue from "@/app/watch/[id]/[ep]/_components/panel/subtitle-cue";
import { TabsContent } from "@/components/ui/tabs";
import { SubtitleCue as TSubtitleCue, SubtitleTranscription } from "@/types/subtitle";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useWatchStore } from "@/app/watch/[id]/[ep]/store";
import { srtTimestampToSeconds } from "@/lib/funcs";

// Create a memoized SubtitleCueItem component
const MemoizedSubtitleCue = memo(SubtitleCue);

type SubtitlesListProps = {
    isLoading: boolean;
    displayTranscription: SubtitleTranscription;
    displayCues: TSubtitleCue[]
}

export default function SubtitlesList({
    displayTranscription,
    isLoading,
    displayCues
}: SubtitlesListProps) {

    const [activeIndex, setActiveIndex] = useState<number>(-1);
    const [autoScroll, setAutoScroll] = useState<boolean>(true);
    
    const activeCueIdRef = useRef<number>(-1);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastUpdateTimeRef = useRef<number>(0);
    
    const player = useWatchStore((state) => state.player);
    const delay = useWatchStore((state) => state.delay);

    const cueTimeRanges = useMemo(() => {
        if (!displayCues?.length) return [];
        
        return displayCues.map(cue => ({
            id: cue.id,
            index: displayCues.indexOf(cue),
            start: srtTimestampToSeconds(cue.from) + delay.japanese,
            end: srtTimestampToSeconds(cue.to) + delay.japanese
        }));
    }, [displayCues, delay.japanese]);

    const rowVirtualizer = useVirtualizer({
        count: displayCues?.length || 0,
        getScrollElement: () => scrollAreaRef.current,
        estimateSize: useCallback(() => 60, []),
        overscan: 10,
        measureElement: useCallback((element: Element) => {
            return element.getBoundingClientRect().height || 60;
        }, [])
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
        if(!player.current || !displayCues?.length || !cueTimeRanges.length) return;

        return player.current.subscribe(({ currentTime }) => {
            const now = Date.now();
            if (now - lastUpdateTimeRef.current > 100) {
                lastUpdateTimeRef.current = now;
                findActiveCue(currentTime);
            }
        });
    }, [player, displayCues, cueTimeRanges, findActiveCue]);

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
            className="overflow-auto h-[80vh] w-full"
            style={{
                opacity: isLoading ? 0.8 : 1,
            }}
            onScroll={handleManualScroll}
        >
            <TabsContent 
                value={displayTranscription}
                className="relative w-full"
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    position: 'relative',
                }}
            >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const cue = displayCues[virtualRow.index];
                    
                    return (
                        <MemoizedSubtitleCue 
                            key={virtualRow.key}
                            cue={cue} 
                            index={virtualRow.index}
                            isActive={activeCueIdRef.current === cue.id}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                        />
                    );
                })}
            </TabsContent>
        </div>
    )
}