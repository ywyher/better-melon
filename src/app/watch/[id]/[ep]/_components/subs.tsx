"use client"

import { selectFile } from "@/app/watch/[id]/[ep]/funcs";
import { JimakuFile } from "@/app/watch/[id]/[ep]/types";
import Dialogue from "@/components/dialogue";
import { parseSubToJson } from "@/lib/fetch-subs";
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Indicator } from "@/components/indicator";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Files from "@/app/watch/[id]/[ep]/_components/files";
import { Mode } from "@/types/index";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWatchStore } from "@/app/watch/[id]/[ep]/store";

export default function Subs({ filesData }: { filesData: JimakuFile[] }) {
    const [isLoading, setIsLoading] = useState(true)
    const [mode, setMode] = useState<Mode>('japanese')
    const sub = useWatchStore((state) => state.sub)
    const setSub = useWatchStore((state) => state.setSub)

    const router = useRouter()

    const { data: subs, isLoading: isSubsLoading, error: subsError } = useQuery({
        queryKey: ['subs', mode, sub],
        queryFn: async () => {
            if(sub && sub.url) return await parseSubToJson({ url: sub.url, format: 'srt', mode: mode })
            else throw new Error("Couldn't get the file")
        },
        staleTime: Infinity,
        enabled: !!sub
    })

    useEffect(() => {
        if (filesData) {
            const selectedFile = selectFile(filesData);
            setSub(selectedFile);
        }
    }, [filesData]);

    useEffect(() => {
        if(subs?.length && sub) {
            setIsLoading(false)
        }
    }, [subs, sub])

    if (subsError) {
        return (
            <Indicator color="red" message={subsError.message || ""} type="error" />
        );
    }

    return (
        <Card className="flex flex-col gap-3 w-fit">
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-xl">Dialogue</CardTitle>
                {sub && !isLoading && (
                    <div className="flex flex-row gap-2">
                        <Button
                            onClick={() => router.push(sub.url)}
                            size="sm"
                            variant='secondary'
                        >
                            Download File
                        </Button>
                        <Files 
                            files={filesData}
                        />
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[80vh]">
                    <div>
                        {(isLoading) && <Indicator type="loading" color="white" message="Fetching Data..." />}
                        {sub && (
                            <Dialogue
                                subs={subs}
                                mode={mode}
                                setMode={setMode}
                                isLoading={isSubsLoading}
                            />
                        )}
                        {(!isSubsLoading && !sub) && (
                            <Card className="w-full p-4 bg-yellow-50 border-yellow-200">
                                <CardContent className="p-0 text-center text-yellow-700">
                                    <p>No subtitle files were found for this episode</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}