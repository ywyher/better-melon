"use client"

import SubtitleFileSelector from "@/app/watch/[id]/[ep]/_components/subtitle-file-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { subtitleScripts } from "@/lib/constants";
import { ActiveSubtitleFile, SubtitleCue, SubtitleFile, SubtitleScript } from "@/types/subtitle";
import { useRouter } from "next/navigation";

type PanelHeaderProps = {
    isLoading: boolean;
    isPendingTransition: boolean;
    subtitleCues?: SubtitleCue[];
    activeSubtitleFile: ActiveSubtitleFile | null;
    subtitleFiles: SubtitleFile[]
    handleScriptChange: (script: SubtitleScript) => void
}

export default function PanelHeader({
    isLoading,
    isPendingTransition,
    subtitleCues,
    activeSubtitleFile,
    subtitleFiles,
    handleScriptChange
}: PanelHeaderProps) {
    const router = useRouter();
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
                        {subtitleScripts.filter(s => s != 'english').map((script, index) => (
                            <TabsTrigger
                                key={index}
                                value={script}
                                onClick={() => handleScriptChange(script as SubtitleScript)}
                                disabled={isPendingTransition || isLoading}
                                className="cursor-pointer"
                            >
                                {script}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>
            )}
        </CardHeader>
    )
}