"use client"

import { useQuery } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card";
import { Indicator } from "@/components/indicator";
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
    const [activeCueId, setActiveCueId] = useState<string | null>(null);
    
    const player = useWatchStore((state) => state.player);
    const activeSubtitleFile = useWatchStore((state) => state.activeSubtitleFile);
    const delay = useWatchStore((state) => state.delay);
    const setSubtitleCues = useWatchStore((state) => state.setSubtitleCues);

    // Debounce currentTime updates with requestAnimationFrame to reduce updates
    const currentTimeRef = useRef<number>(0);
    const currentTime = useMediaState('currentTime', player);
    const rafRef = useRef<number | null>(null);
    
    // Update the ref without re-rendering
    useEffect(() => {
        currentTimeRef.current = currentTime || 0;
    }, [currentTime]);

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
    
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
    }, [subtitleCues, setSubtitleCues]);
    
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

    // Memoize the time ranges of all cues for more efficient lookup
    const cueTimeRanges = useMemo(() => {
        if (!displayCues) return [];
        
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

    const handleScriptChange = (script: SubtitleScript) => {
        startTransition(() => {
            setDisplayScript(script);
        });
    };

    // Find the active cue and update with requestAnimationFrame
    useEffect(() => {
        // Clean up previous RAF
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
        }
        
        // Function to update active cue efficiently
        const updateActiveCue = () => {
            if (!displayCues?.length || !cueTimeRanges.length) {
                rafRef.current = requestAnimationFrame(updateActiveCue);
                return;
            }
            
            const time = currentTimeRef.current;
            
            // Find cue that matches current time
            const activeCue = cueTimeRanges.find(cue => 
                time >= cue.start && time <= cue.end
            );
            
            if (activeCue) {
                // Only update state if the active cue has changed
                if (activeCue.id !== parseInt(activeCueId || "0")) {
                    setActiveCueId(activeCue.id.toString());
                    
                    // Only update active index if it's changed
                    if (activeCue.index !== activeIndex) {
                        setActiveIndex(activeCue.index);
                        
                        // Scroll to the active subtitle if auto-scroll is enabled
                        if (autoScroll) {
                            rowVirtualizer.scrollToIndex(activeCue.index, { 
                                align: 'center',
                                behavior: 'smooth'
                            });
                        }
                    }
                }
            } else if (activeCueId !== null) {
                // Clear active cue when no cue is active
                setActiveCueId(null);
                setActiveIndex(-1);
            }
            
            // Continue the animation frame loop
            rafRef.current = requestAnimationFrame(updateActiveCue);
        };
        
        // Start the RAF loop
        rafRef.current = requestAnimationFrame(updateActiveCue);
        
        // Clean up when component unmounts
        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [displayCues, cueTimeRanges, activeIndex, activeCueId, autoScroll, rowVirtualizer]);

    // Memoize the active cue check to avoid recalculations
    const isCueActive = useCallback((cue: TSubtitleCue) => {
        return cue.id === parseInt(activeCueId || "0");
    }, [activeCueId]);

    // Handle manual scroll to disable auto-scroll temporarily
    const handleManualScroll = useCallback(() => {
        // Disable auto-scroll when user manually scrolls
        setAutoScroll(false);
        
        // Clear existing timer if there is one
        if (autoScrollTimerRef.current) {
            clearTimeout(autoScrollTimerRef.current);
        }
        
        // Re-enable auto-scroll after 5 seconds of inactivity
        autoScrollTimerRef.current = setTimeout(() => {
            setAutoScroll(true);
        }, 5000);
    }, []);

    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (autoScrollTimerRef.current) {
                clearTimeout(autoScrollTimerRef.current);
            }
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, []);

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