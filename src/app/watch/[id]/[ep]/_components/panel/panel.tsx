"use client"

import { useQuery } from "@tanstack/react-query"
import { useEffect, useRef, useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Indicator } from "@/components/indicator";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useWatchStore } from "@/app/watch/[id]/[ep]/store";
import SubtitleCue from "@/app/watch/[id]/[ep]/_components/panel/subtitle-cue";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SubtitleCue as TSubtitleCue, SubtitleScript, SubtitleFile } from "@/types/subtitle";
import SubtitleFileSelector from "@/app/watch/[id]/[ep]/_components/subtitle-file-selector";
import { parseSubtitleToJson } from "@/lib/fetch-subs";
import { srtTimestampToSeconds } from "@/lib/funcs";
import { useVirtualizer } from '@tanstack/react-virtual';
import { useMediaState } from '@vidstack/react'; // Import useMediaState
import {franc} from 'franc-min'
import { toast } from "sonner";
import { selectSubtitleFile } from "@/app/watch/[id]/[ep]/funcs";

export default function SubtitlePanel({ subtitleFiles }: { subtitleFiles: SubtitleFile[] }) {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [displayScript, setDisplayScript] = useState<SubtitleScript>('japanese')
    const [isPending, startTransition] = useTransition();
    const [previousCues, setPreviousCues] = useState<TSubtitleCue[] | undefined>();
    const [activeIndex, setActiveIndex] = useState<number>(-1);
    const [autoScroll, setAutoScroll] = useState<boolean>(true);
    
    const player = useWatchStore((state) => state.player);
    const activeSubtitleFile = useWatchStore((state) => state.activeSubtitleFile);
    const setActiveSubtitleFile = useWatchStore((state) => state.setActiveSubtitleFile);
    const setSubtitleCues = useWatchStore((state) => state.setSubtitleCues);
    const delay = useWatchStore((state) => state.delay);

    const currentTime = useMediaState('currentTime', player);

    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    const displayScripts = [
        { name: "japanese" }, // normal|default
        { name: "hiragana" },
        { name: "katakana" },
        { name: "romaji" },
    ]

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
    }, [activeSubtitleFile])
    
    useEffect(() => {
        if(subtitleCues?.length && activeSubtitleFile) {
            setSubtitleCues(subtitleCues)
            setIsLoading(false)
        }
    }, [subtitleCues, activeSubtitleFile])

    useEffect(() => {
        if(!subtitleCues?.length) return;
        
        const content = subtitleCues.slice(0, Math.ceil(subtitleCues.length / 2)) // Get the first half
            .map((cue) => cue.content)
            .join(' ')

        const result = franc(content)

        if(result != 'jpn') {
            const selected = selectSubtitleFile(subtitleFiles)
            if(!selected) return;
            setActiveSubtitleFile({
                source: 'remote',
                file: {
                    name: selected.name,
                    url: selected.url,
                    last_modified: selected.last_modified,
                    size: selected.size
                }
            });
            toast.warning("You can only use japanese subtitles!")            
        }
    }, [subtitleCues])

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

    const handleDisplayScriptChange = (newDisplayScript: SubtitleScript) => {
        startTransition(() => {
            setDisplayScript(newDisplayScript);
        });
    };

    const isCueActive = (cue: TSubtitleCue) => {
        if (!cue || !currentTime) return false;
        const startTime = srtTimestampToSeconds(cue.from);
        const endTime = srtTimestampToSeconds(cue.to);
        return currentTime >= startTime + delay.japanese && currentTime <= endTime + delay.japanese;
    };

    // Find the active cue index and scroll to it when currentTime changes
    useEffect(() => {
        if (!displayCues || !displayCues.length || !currentTime) return;
        
        // Find the index of the active subtitle
        const currentActiveIndex = displayCues.findIndex(cue => {
            const startTime = srtTimestampToSeconds(cue.from);
            const endTime = srtTimestampToSeconds(cue.to);
            return currentTime >= startTime + delay.japanese && currentTime <= endTime + delay.japanese;
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
            <Tabs defaultValue={displayScript || displayScripts[0].name} value={displayScript}>
                <CardHeader className="flex flex-col gap-3">
                    <div className="flex flex-row justify-between items-center w-full">
                        <CardTitle className="text-xl">Dialogue</CardTitle>
                        {subtitleCues && !isLoading && (
                            <div className="flex flex-row gap-2">
                                {activeSubtitleFile?.source == 'remote' && (
                                    <Button
                                        onClick={() => router.push(activeSubtitleFile?.file.url || "")}
                                        size="sm"
                                        variant='secondary'
                                    >
                                        Download Subtitle
                                    </Button>
                                )}
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
                                {displayScripts.map((displayScriptOption, index) => (
                                    <TabsTrigger
                                        key={index}
                                        value={displayScriptOption.name}
                                        onClick={() => handleDisplayScriptChange(displayScriptOption.name as SubtitleScript)}
                                        disabled={isPending || isCuesLoading}
                                        className="cursor-pointer"
                                    >
                                        {displayScriptOption.name}
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
                                            variant="default"
                                            setActiveIndex={setActiveIndex}
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