"use client"

import { useQuery } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card";
import { Indicator } from "@/components/indicator";
import { useRouter } from "next/navigation";
import { useWatchStore } from "@/app/watch/[id]/[ep]/store";
import SubtitleCue from "@/app/watch/[id]/[ep]/_components/panel/subtitle-cue";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { SubtitleCue as TSubtitleCue, SubtitleScript, SubtitleFile } from "@/types/subtitle";
import { parseSubtitleToJson } from "@/lib/fetch-subs";
import { srtTimestampToSeconds } from "@/lib/funcs";
import { useVirtualizer } from '@tanstack/react-virtual';
import { useMediaState } from '@vidstack/react';
import { subtitleScripts } from "@/lib/constants";
import PanelHeader from "@/app/watch/[id]/[ep]/_components/panel/panel-header";

export default function SubtitlePanel({ subtitleFiles }: { subtitleFiles: SubtitleFile[] }) {
    const [displayScript, setDisplayScript] = useState<SubtitleScript>('japanese')
    const [isPendingTransition, startTransition] = useTransition();
    const [previousCues, setPreviousCues] = useState<TSubtitleCue[] | undefined>();
    const [activeIndex, setActiveIndex] = useState<number>(-1);
    const [autoScroll, setAutoScroll] = useState<boolean>(true);
    
    const player = useWatchStore((state) => state.player);
    const activeSubtitleFile = useWatchStore((state) => state.activeSubtitleFile);
    const delay = useWatchStore((state) => state.delay);
    const setSubtitleCues = useWatchStore((state) => state.setSubtitleCues);

    const currentTime = useMediaState('currentTime', player);

    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    
    const { data: subtitleCues, isLoading: isCuesLoading, error: cuesError, refetch } = useQuery({
        queryKey: ['subs', displayScript, activeSubtitleFile],
        queryFn: async () => {
            if(activeSubtitleFile) {
                const format = activeSubtitleFile?.source == 'remote' 
                ? activeSubtitleFile!.file.url.split('.').pop() as "srt" | "vtt"
                : activeSubtitleFile!.file.name.split('.').pop() as "srt" | "vtt";
                
                return await parseSubtitleToJson({ 
                    source: activeSubtitleFile?.source == 'remote' 
                        ? activeSubtitleFile.file.url 
                        : activeSubtitleFile.file,
                    format,
                    script: displayScript
                })
            }
            else throw new Error("Couldn't get the file")
        },
        staleTime: Infinity,
        enabled: !!activeSubtitleFile
    })

    useEffect(() => {
        refetch()
    }, [activeSubtitleFile, refetch])

    useEffect(() => {
        if (subtitleCues?.length) {
            setSubtitleCues(subtitleCues);
        }
    }, [subtitleCues]);
    
    // If we have new subs that aren't loading, update our previous subs
    useEffect(() => {
        if (subtitleCues && !isCuesLoading && JSON.stringify(subtitleCues) !== JSON.stringify(previousCues)) {
            setPreviousCues(subtitleCues);
        }
    }, [subtitleCues, isCuesLoading, previousCues]);
    
    // Use either current subs or previous subs to prevent empty states
    const displayCues = useMemo(() => {
        return isCuesLoading ? previousCues : subtitleCues;
    }, [isCuesLoading, previousCues, subtitleCues]);

    const rowVirtualizer = useVirtualizer({
        count: displayCues?.length || 0,
        getScrollElement: () => scrollAreaRef.current,
        estimateSize: useCallback(() => 60, []),
        overscan: 10,
        measureElement: useCallback((element: Element) => {
            return element.getBoundingClientRect().height || 60;
        }, [])
    });

    const handleScriptChange = (script: SubtitleScript) => {
        startTransition(() => {
            setDisplayScript(script);
        });
    };

    // Find the active cue index and scroll to it when currentTime changes
    useEffect(() => {
        if (!displayCues || !displayCues.length || !currentTime) return;
        
        // Find the index of the active subtitle
        const currentActiveIndex = displayCues.findIndex(cue => {
            const startTime = srtTimestampToSeconds(cue.from);
            const endTime = srtTimestampToSeconds(cue.to);
            return (currentTime + .1) >= startTime + delay.japanese && (currentTime + .1) <= endTime + delay.japanese;
        });
        
        // If found an active subtitle and it's different from the current one
        if (currentActiveIndex !== -1 && currentActiveIndex !== activeIndex) {
            setActiveIndex(currentActiveIndex);
            
            // Scroll to the active subtitle if auto-scroll is enabled
            if (autoScroll) {
                rowVirtualizer.scrollToIndex(currentActiveIndex, { 
                    align: 'center',
                    behavior: 'smooth'
                });
            }
        }
    }, [currentTime, displayCues, activeIndex, autoScroll, delay.japanese]);



    const isCueActive = useCallback((cue: TSubtitleCue) => {
        if (!cue || !currentTime || !subtitleCues) return false;
        const startTime = srtTimestampToSeconds(cue.from) + delay.japanese;
        const endTime = srtTimestampToSeconds(cue.to) + delay.japanese;
        
        // Check if this cue's time range contains the current time
        const isInTimeRange = currentTime >= startTime && currentTime <= endTime;
        
        // If at a boundary, prioritize the next cue
        if (isInTimeRange) {
            const exactBoundary = subtitleCues.find(otherCue => 
            srtTimestampToSeconds(otherCue.from) + delay.japanese === endTime && 
            otherCue !== cue
            );
            
            if (exactBoundary && currentTime === endTime) {
            return false; // Don't show this cue at exact boundary, prefer the next one
            }
            
            return true;
        }
        
        return false;
    }, [cuesError, delay.japanese, subtitleCues, currentTime]);

    // Handle manual scroll to disable auto-scroll temporarily
    const handleManualScroll = useCallback(() => {
        // Disable auto-scroll for a short period when user manually scrolls
        setAutoScroll(false);
        
        // Re-enable auto-scroll after 5 seconds of inactivity
        const timer = setTimeout(() => {
            setAutoScroll(true);
        }, 5000);
        
        return () => clearTimeout(timer);
    }, [setAutoScroll]);

    if (cuesError) {
        return (
            <Indicator color="red" message={cuesError?.message || "Error"} type="error" />
        );
    }

    return (
        <Card className="flex flex-col gap-3 w-full max-w-[500px]">
            <Tabs defaultValue={displayScript || subtitleScripts[0]} value={displayScript}>
                <PanelHeader 
                    handleScriptChange={handleScriptChange}
                    isLoading={isCuesLoading}
                    isPendingTransition={isPendingTransition}
                    subtitleCues={subtitleCues}
                    activeSubtitleFile={activeSubtitleFile}
                    subtitleFiles={subtitleFiles}
                />
                <CardContent>
                    {activeSubtitleFile && displayCues ? (
                        <div 
                            ref={scrollAreaRef} 
                            className="overflow-auto h-[80vh] w-full"
                            style={{
                                opacity: (isPendingTransition || isCuesLoading) ? 0.8 : 1,
                            }}
                            onScroll={handleManualScroll}
                        >
                            <TabsContent 
                                value={displayScript}
                                className="relative w-full"
                                style={{
                                    height: `${rowVirtualizer.getTotalSize()}px`,
                                    position: 'relative',
                                }}
                            >
                                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                    const cue = displayCues[virtualRow.index];
                                    const isActive = isCueActive(cue);
                                    
                                    return (
                                        <SubtitleCue 
                                            key={virtualRow.key}
                                            index={virtualRow.index}
                                            cue={cue} 
                                            isActive={isActive}
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
                    ) : (
                        !isCuesLoading && (
                            <Card className="w-full p-4 bg-yellow-50 border-yellow-200">
                                <CardContent className="p-0 text-center text-yellow-700">
                                    <p>No subtitle files were found for this episode</p>
                                </CardContent>
                            </Card>
                        )
                    )}
                </CardContent>
            </Tabs>
        </Card>
    );
}