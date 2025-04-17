"use client"

import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card";
import { Indicator } from "@/components/indicator";
import { useWatchStore } from "@/app/watch/[id]/[ep]/store";
import { Tabs } from "@/components/ui/tabs";
import type { SubtitleCue as TSubtitleCue, SubtitleTranscription, SubtitleFile } from "@/types/subtitle";
import { parseSubtitleToJson } from "@/lib/fetch-subs";
import { subtitleTranscriptions } from "@/lib/constants";
import PanelHeader from "@/app/watch/[id]/[ep]/_components/panel/panel-header";
import SubtitlesList from "@/app/watch/[id]/[ep]/_components/panel/subtitles-list";
import PanelSkeleton from "@/app/watch/[id]/[ep]/_components/panel/panel-skeleton";

export default function SubtitlePanel({ subtitleFiles }: { subtitleFiles: SubtitleFile[] }) {
    const [displayTranscription, setDisplayTranscription] = useState<SubtitleTranscription>('japanese')
    const [previousCues, setPreviousCues] = useState<TSubtitleCue[] | undefined>();

    const activeSubtitleFile = useWatchStore((state) => state.activeSubtitleFile);
    const setSubtitleCues = useWatchStore((state) => state.setSubtitleCues);

    const { data: subtitleCues, isLoading: isCuesLoading, error: cuesError, refetch } = useQuery({
        queryKey: ['subs', displayTranscription, activeSubtitleFile],
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
                    transcription: displayTranscription
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

    const displayCues = useMemo(() => {
        return isCuesLoading ? previousCues : subtitleCues;
    }, [isCuesLoading, previousCues, subtitleCues]);

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

    if (cuesError) {
        return (
            <Indicator color="red" message={cuesError?.message || "Error"} type="error" />
        );
    }

    if(isCuesLoading) return <PanelSkeleton />

    return (
        <Card className="flex flex-col gap-3 w-full max-w-[500px] h-fit">
            <Tabs defaultValue={displayTranscription || subtitleTranscriptions[0]} value={displayTranscription}>
                <PanelHeader 
                    isLoading={isCuesLoading}
                    subtitleCues={subtitleCues}
                    activeSubtitleFile={activeSubtitleFile}
                    subtitleFiles={subtitleFiles}
                    setDisplayTranscription={setDisplayTranscription}
                />
                <CardContent>
                    {activeSubtitleFile && displayCues ? (
                        <SubtitlesList
                            isLoading={isCuesLoading}
                            displayTranscription={displayTranscription}
                            displayCues={displayCues}
                        />
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