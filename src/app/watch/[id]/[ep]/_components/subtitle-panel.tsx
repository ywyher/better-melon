"use client"

import { useQuery } from "@tanstack/react-query"
import { useEffect, useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Indicator } from "@/components/indicator";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWatchStore } from "@/app/watch/[id]/[ep]/store";
import SubtitleCue, { SubtitleCueSkeleton } from "@/app/watch/[id]/[ep]/_components/subtitle-cue";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SubtitleCue as TSubtitleCue, SubtitleDisplayMode, SubtitleFile } from "@/types/subtitle";
import SubtitleFileSelector from "@/app/watch/[id]/[ep]/_components/subtitle-file-selector";
import { parseSubtitleToJson } from "@/lib/fetch-subs";

export default function SubtitlePanel({ subtitleFiles }: { subtitleFiles: SubtitleFile[] }) {
    const [isLoading, setIsLoading] = useState(true)
    const [displayMode, setDisplayMode] = useState<SubtitleDisplayMode>('japanese')
    const [isPending, startTransition] = useTransition();
    const [previousCues, setPreviousCues] = useState<TSubtitleCue[] | undefined>();
    
    const activeSubtitleFile = useWatchStore((state) => state.activeSubtitleFile)

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
                    <ScrollArea className="h-[80vh]">
                        <div>
                            {(isLoading) && <Indicator type="loading" color="white" message="Fetching Data..." />}
                            {activeSubtitleFile ? (
                                <div className={`relative ${(isPending || isCuesLoading) ? 'opacity-80' : 'opacity-100'}`}>
                                    <TabsContent value={displayMode}>
                                        {displayCues && displayCues.length ? (
                                            <div className="space-y-2">
                                                {displayCues.map((cue) => (
                                                    <SubtitleCue key={cue.id} cue={cue} />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {[1,2,3,4,5].map((_, index) => (
                                                    <SubtitleCueSkeleton key={index} />
                                                ))}
                                            </div>
                                        )}
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