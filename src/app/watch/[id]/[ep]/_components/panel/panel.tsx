"use client"

import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card";
import { Indicator } from "@/components/indicator";
import { usePlayerStore } from "@/lib/stores/player-store";
import { Tabs } from "@/components/ui/tabs";
import type { SubtitleCue as TSubtitleCue, SubtitleTranscription, SubtitleFile, SubtitleCue } from "@/types/subtitle";
import { subtitleTranscriptions } from "@/lib/constants/subtitle";
import PanelHeader from "@/app/watch/[id]/[ep]/_components/panel/panel-header";
import SubtitleCuesList from "@/app/watch/[id]/[ep]/_components/panel/subtitles-cues-list";
import PanelSkeleton from "@/app/watch/[id]/[ep]/_components/panel/panel-skeleton";
import { subtitleQueries } from "@/lib/queries/subtitle";

export default function SubtitlePanel({ 
  subtitleFiles,
  japaneseTranscription
}: { 
  subtitleFiles: SubtitleFile[],
  japaneseTranscription: SubtitleCue[]
}) {
    const [selectedTranscription, setSelectedTranscription] = useState<SubtitleTranscription>('japanese')
    const [previousCues, setPreviousCues] = useState<TSubtitleCue[] | undefined>();

    const activeSubtitleFile = usePlayerStore((state) => state.activeSubtitleFile);
    const setSubtitleCues = usePlayerStore((state) => state.setSubtitleCues);
    
    const { data: subtitleCues, isLoading: isCuesLoading, error: cuesError } = useQuery({
      ...subtitleQueries.cues(activeSubtitleFile!, selectedTranscription),
      placeholderData: japaneseTranscription,
      enabled: !!activeSubtitleFile
    })

    const cues = useMemo(() => {
      return isCuesLoading ? previousCues : subtitleCues;
    }, [isCuesLoading, previousCues, subtitleCues]);

    useEffect(() => {
      if (subtitleCues?.length) {
        setSubtitleCues(subtitleCues);
      }
    }, [subtitleCues, setSubtitleCues]);
    
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
        <Card className="flex flex-col gap-3 w-full lg:max-w-[500px] lg:min-h-[80vh] h-fit border-0 lg:border-1 p-0 m-0 lg:py-5">
            <Tabs className="h-full" defaultValue={selectedTranscription || subtitleTranscriptions[0]} value={selectedTranscription}>
                <PanelHeader 
                    isLoading={isCuesLoading}
                    activeSubtitleFile={activeSubtitleFile}
                    subtitleFiles={subtitleFiles}
                    setSelectedTranscription={setSelectedTranscription}
                />
                <CardContent className="h-full flex justify-center items-center w-full">
                  {activeSubtitleFile && cues ? (
                      <SubtitleCuesList
                          isLoading={isCuesLoading}
                          selectedTranscription={selectedTranscription}
                          cues={cues}
                      />
                  ): (
                    <Card className="w-full p-4 bg-yellow-50 border-yellow-200">
                      <CardContent className="p-0 text-center text-yellow-700">
                          <p>No subtitle files were found for this episode</p>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
            </Tabs>
        </Card>
    );
}