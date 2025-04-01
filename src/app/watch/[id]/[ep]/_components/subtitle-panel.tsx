"use client"

import { useQuery } from "@tanstack/react-query"
import { useEffect, useRef, useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Indicator } from "@/components/indicator";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useWatchStore } from "@/app/watch/[id]/[ep]/store";
import SubtitleCue from "@/app/watch/[id]/[ep]/_components/subtitle-cue";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SubtitleCue as TSubtitleCue, SubtitleDisplayMode, SubtitleFile } from "@/types/subtitle";
import SubtitleFileSelector from "@/app/watch/[id]/[ep]/_components/subtitle-file-selector";
import { parseSubtitleToJson } from "@/lib/fetch-subs";
import { srtTimestampToSeconds } from "@/lib/funcs";
import { useVirtualizer } from '@tanstack/react-virtual';

export default function SubtitlePanel({ subtitleFiles }: { subtitleFiles: SubtitleFile[] }) {
    const [isLoading, setIsLoading] = useState(true)
    const [displayMode, setDisplayMode] = useState<SubtitleDisplayMode>('japanese')
    const [isPending, startTransition] = useTransition();
    const [previousCues, setPreviousCues] = useState<TSubtitleCue[] | undefined>();
    const [activeIndex, setActiveIndex] = useState<number>(-1);
    const [autoScroll, setAutoScroll] = useState<boolean>(true);
    
    const currentTime = useWatchStore((state) => state.currentTime)
    const activeSubtitleFile = useWatchStore((state) => state.activeSubtitleFile)

    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    const displayModes = [
        { name: "japanese" }, // normal|default
        { name: "hiragana" },
        { name: "katakana" },
        { name: "romaji" },
    ]

    const { data: subtitleCues, isLoading: isCuesLoading, error: cuesError } = useQuery({
        queryKey: ['subs', displayMode, activeSubtitleFile],
        queryFn: async () => {
            if(activeSubtitleFile && activeSubtitleFile.url) return await parseSubtitleToJson({ url: activeSubtitleFile.url, format: 'srt', mode: displayMode })
            else throw new Error("Couldn't get the file")
        },
        staleTime: Infinity,
        enabled: !!activeSubtitleFile
    })

    useEffect(() => {
        if(subtitleCues?.length && activeSubtitleFile) {
            console.log(`subtitleCues`)
            console.log(subtitleCues)
            setIsLoading(false)
        }
    }, [subtitleCues, activeSubtitleFile])

    // If we have new subs that aren't loading, update our previous subs
    useEffect(() => {
        if (subtitleCues && !isCuesLoading && JSON.stringify(subtitleCues) !== JSON.stringify(previousCues)) {
            setPreviousCues(subtitleCues);
        }
    }, [subtitleCues, isCuesLoading, previousCues]);
    
    // Use either current subs or previous subs to prevent empty states
    const displayCues = isCuesLoading ? previousCues : subtitleCues;

    const rowVirtualizer = useVirtualizer({
        count: displayCues?.length || 0,
        getScrollElement: () => scrollAreaRef.current,
        estimateSize: () => 60,
        overscan: 5
    });

    const handleDisplayModeChange = (newDisplayMode: SubtitleDisplayMode) => {
        startTransition(() => {
            setDisplayMode(newDisplayMode);
        });
    };

    const isCueActive = (cue: TSubtitleCue) => {
        if (!cue) return false;
        const startTime = srtTimestampToSeconds(cue.from);
        const endTime = srtTimestampToSeconds(cue.to);
        return currentTime >= startTime && currentTime <= endTime;
    };

    // Find the active cue index and scroll to it when currentTime changes
    useEffect(() => {
        if (!displayCues || !displayCues.length) return;
        
        // Find the index of the active subtitle
        const currentActiveIndex = displayCues.findIndex(cue => {
            const startTime = srtTimestampToSeconds(cue.from);
            const endTime = srtTimestampToSeconds(cue.to);
            return currentTime >= startTime && currentTime <= endTime;
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
    }, [currentTime, displayCues, activeIndex, autoScroll, rowVirtualizer]);

    // Handle manual scroll to disable auto-scroll temporarily
    const handleManualScroll = () => {
        // Disable auto-scroll for a short period when user manually scrolls
        setAutoScroll(false);
        
        // Re-enable auto-scroll after 5 seconds of inactivity
        const timer = setTimeout(() => {
            setAutoScroll(true);
        }, 5000);
        
        return () => clearTimeout(timer);
    };

    if (cuesError) {
        return (
            <Indicator color="red" message={cuesError?.message || "Error"} type="error" />
        );
    }

    return (
        <Card className="flex flex-col gap-3 w-full max-w-[500px]">
            <Tabs defaultValue={displayMode || displayModes[0].name} value={displayMode}>
                <CardHeader className="flex flex-col gap-3">
                    <div className="flex flex-row justify-between items-center w-full">
                        <CardTitle className="text-xl">Dialogue</CardTitle>
                        {subtitleCues && !isLoading && (
                            <div className="flex flex-row gap-2">
                                <Button
                                    onClick={() => router.push(activeSubtitleFile?.url || "")}
                                    size="sm"
                                    variant='secondary'
                                >
                                    Download File
                                </Button>
                                <SubtitleFileSelector 
                                    subtitleFiles={subtitleFiles}
                                />
                            </div>
                        )}
                    </div>
                    {activeSubtitleFile && (
                        <div className="relative w-full">
                            {(isPending || isCuesLoading) && (
                                <Badge className="absolute top-1 right-2 rounded-full text-sm">
                                    Loading...
                                </Badge>
                            )}
                            <TabsList className="w-full">
                                {displayModes.map((displayModeOption, index) => (
                                    <TabsTrigger
                                        key={index}
                                        value={displayModeOption.name}
                                        onClick={() => handleDisplayModeChange(displayModeOption.name as SubtitleDisplayMode)}
                                        disabled={isPending || isCuesLoading}
                                        className="cursor-pointer"
                                    >
                                        {displayModeOption.name}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                    )}
                </CardHeader>
                
                <CardContent>
                    {activeSubtitleFile && displayCues ? (
                        <div 
                            ref={scrollAreaRef} 
                            className="overflow-auto h-[80vh] w-full"
                            style={{
                                opacity: (isPending || isCuesLoading) ? 0.8 : 1,
                            }}
                            onScroll={handleManualScroll}
                        >
                            <TabsContent 
                                value={displayMode}
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
                                            cue={cue} 
                                            isActive={isActive} 
                                            variant="default"
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