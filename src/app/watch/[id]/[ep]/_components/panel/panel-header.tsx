"use client"

import SubtitleFileSelector from "@/app/watch/[id]/[ep]/_components/subtitle-file-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { subtitleTranscriptions } from "@/lib/constants/subtitle";
import { ActiveSubtitleFile, SubtitleCue, SubtitleFile, SubtitleTranscription } from "@/types/subtitle";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useCallback, useTransition } from "react";

type PanelHeaderProps = {
    isLoading: boolean;
    subtitleCues?: SubtitleCue[];
    activeSubtitleFile: ActiveSubtitleFile | null;
    subtitleFiles: SubtitleFile[];
    setSelectedTranscription: Dispatch<SetStateAction<SubtitleTranscription>>
}

export default function PanelHeader({
    isLoading,
    subtitleCues,
    activeSubtitleFile,
    subtitleFiles,
    setSelectedTranscription
}: PanelHeaderProps) {
    const router = useRouter();
    const [isPendingTransition, startTransition] = useTransition();

    const handleTranscriptionChange = useCallback((transcirption: SubtitleTranscription) => {
        startTransition(() => {
            setSelectedTranscription(transcirption);
        });
    }, [setSelectedTranscription]);

    return (
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
                    {(isPendingTransition || isLoading) && (
                        <Badge className="absolute top-1 right-2 rounded-full text-sm">
                            Loading...
                        </Badge>
                    )}
                    <TabsList className="w-full">
                        {subtitleTranscriptions.filter(s => s != 'english').map((transcription, index) => (
                            <TabsTrigger
                                key={index}
                                value={transcription}
                                onClick={() => handleTranscriptionChange(transcription as SubtitleTranscription)}
                                disabled={isPendingTransition || isLoading}
                                className="cursor-pointer"
                            >
                                {transcription}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>
            )}
        </CardHeader>
    )
}