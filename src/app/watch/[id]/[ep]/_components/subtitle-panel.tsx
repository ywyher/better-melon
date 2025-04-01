"use client"

import { useQuery } from "@tanstack/react-query"
import { useEffect, useState, useTransition, useRef, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Indicator } from "@/components/indicator";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWatchStore } from "@/app/watch/[id]/[ep]/store";
import SubtitleCue from "@/app/watch/[id]/[ep]/_components/subtitle-cue";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SubtitleCue as TSubtitleCue, SubtitleDisplayMode, SubtitleFile } from "@/types/subtitle";
import SubtitleFileSelector from "@/app/watch/[id]/[ep]/_components/subtitle-file-selector";
import { parseSubtitleToJson } from "@/lib/fetch-subs";
import { srtTimestampToSeconds } from "@/lib/funcs";
import { VariableSizeList as List } from 'react-window';

const ITEM_HEIGHT = 80; // Approximate height of each cue item
const SCROLL_OFFSET = 300; // Pixels to scroll when active cue changes

export default function SubtitlePanel({ subtitleFiles }: { subtitleFiles: SubtitleFile[] }) {
    const [isLoading, setIsLoading] = useState(true);
    const [displayMode, setDisplayMode] = useState<SubtitleDisplayMode>('japanese');
    const [isPending, startTransition] = useTransition();
    const [previousCues, setPreviousCues] = useState<TSubtitleCue[] | undefined>();
    
    const currentTime = useWatchStore((state) => state.currentTime);
    const activeSubtitleFile = useWatchStore((state) => state.activeSubtitleFile);

    const listRef = useRef<List>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    
    const router = useRouter();

    const displayModes = [
        { name: "japanese" }, // normal|default
        { name: "hiragana" },
        { name: "katakana" },
        { name: "romaji" },
    ];

    const { data: subtitleCues, isLoading: isCuesLoading, error: cuesError } = useQuery({
        queryKey: ['subs', displayMode, activeSubtitleFile],
        queryFn: async () => {
            if(activeSubtitleFile && activeSubtitleFile.url) 
                return await parseSubtitleToJson({ url: activeSubtitleFile.url, format: 'srt', mode: displayMode });
            else 
                throw new Error("Couldn't get the file");
        },
        staleTime: Infinity,
        enabled: !!activeSubtitleFile
    });

    useEffect(() => {
        if(subtitleCues?.length && activeSubtitleFile) {
            setIsLoading(false);
        }
    }, [subtitleCues, activeSubtitleFile]);

    // If we have new subs that aren't loading, update our previous subs
    useEffect(() => {
        if (subtitleCues && !isCuesLoading && JSON.stringify(subtitleCues) !== JSON.stringify(previousCues)) {
            setPreviousCues(subtitleCues);
        }
    }, [subtitleCues, isCuesLoading, previousCues]);
    
    // Use either current subs or previous subs to prevent empty states
    const displayCues = isCuesLoading ? previousCues : subtitleCues;

    // Find the currently active cue index
    const activeCueIndex = useMemo(() => {
        if (!displayCues) return -1;
        
        return displayCues.findIndex(cue => {
            const from = srtTimestampToSeconds(cue.from) || 0;
            const to = srtTimestampToSeconds(cue.to) || 0;
            return currentTime >= from && currentTime <= to;
        });
    }, [displayCues, currentTime]);

    // Auto-scroll to the active cue
    useEffect(() => {
        if (activeCueIndex >= 0 && listRef.current) {
            listRef.current.scrollToItem(activeCueIndex, 'center');
        }
    }, [activeCueIndex]);

    // Get item height for variable size list
    const getItemSize = (index: number) => {
        // You could implement more sophisticated size calculation based on content
        // For example, consider cue text length, multiple lines, etc.
        return ITEM_HEIGHT;
    };

    const handleDisplayModeChange = (newDisplayMode: SubtitleDisplayMode) => {
        startTransition(() => {
            setDisplayMode(newDisplayMode);
        });
    };

    if (cuesError) {
        return (
            <Indicator color="red" message={cuesError.message || ""} type="error" />
        );
    }

    // Row renderer for react-window
    const RowRenderer = ({ index, style }: { index: number, style: React.CSSProperties }) => {
        if (!displayCues) return null;
        
        const cue = displayCues[index];
        const from = srtTimestampToSeconds(cue.from) || 0;
        const to = srtTimestampToSeconds(cue.to) || 0;
        const isActive = (currentTime >= from && currentTime <= to);

        return (
            <div style={style}>
                <SubtitleCue 
                    key={cue.id} 
                    cue={cue}
                    isActive={isActive}
                />
            </div>
        );
    };

    return (
        <Card className="flex flex-col gap-3 w-fit">
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
                    <ScrollArea className="h-[80vh]" ref={scrollAreaRef}>
                        <div>
                            {activeSubtitleFile && displayCues ? (
                                <div className={`relative ${(isPending || isCuesLoading) ? 'opacity-80' : 'opacity-100'}`}>
                                    <TabsContent value={displayMode} className="h-full">
                                        <List
                                            ref={listRef}
                                            height={80 * 10} // Approximate visible height (adjust as needed)
                                            width="100%"
                                            itemCount={displayCues.length}
                                            itemSize={getItemSize}
                                            overscanCount={5} // Render a few extra items above/below visible area
                                        >
                                            {RowRenderer}
                                        </List>
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
                        </div>
                    </ScrollArea>
                </CardContent>
            </Tabs>
        </Card>
    );
}