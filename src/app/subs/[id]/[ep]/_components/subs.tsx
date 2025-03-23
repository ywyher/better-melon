"use client"

import { Mode } from "@/app/types";
import { filterFiles, selectFile } from "@/app/subs/[id]/[ep]/funcs";
import { File } from "@/app/subs/[id]/[ep]/types";
import Dialogue from "@/components/Dialogue";
import { parseSubToJson } from "@/lib/fetch-subs";
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card";
import { Indicator } from "@/components/indicator";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Files from "@/app/subs/[id]/[ep]/_components/files";

export default function Subs({ id, ep }: { id: string, ep: string }) {
    const [filteredFiles, setFilteredFiles] = useState<File[]>([])
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [mode, setMode] = useState<Mode>('japanese')
    const router = useRouter()

    const { data: searchData, isLoading: isLoadingSearch, error: searchError } = useQuery({
        queryKey: ['anime', 'search', id],
        queryFn: async () => {
            const response = await fetch(`https://jimaku.cc/api/entries/search?anilist_id=${id}`, {
                headers: {
                    "Authorization": 'AAAAAAAABfYuAS66uld8Q19m5bLfkmV0yAJUhmTTqXpDuh8ef0OGVFConw'
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return response.json();
        }
    });

    const animeId = searchData?.[0]?.id;

    const { data: filesData, isLoading: isLoadingFiles, error: filesError } = useQuery({
        queryKey: ['anime', 'files', animeId],
        queryFn: async () => {
            if (!animeId) throw new Error("Anime ID not found");

            const response = await fetch(`https://jimaku.cc/api/entries/${animeId}/files?episode=${ep}`, {
                headers: {
                    "Authorization": 'AAAAAAAABfYuAS66uld8Q19m5bLfkmV0yAJUhmTTqXpDuh8ef0OGVFConw'
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return response.json();
        },
        enabled: !!animeId
    });

    const { data: subs, isLoading: isLoadingSubs, error: subsError, refetch } = useQuery({
        queryKey: ['subs', mode, selectedFile],
        queryFn: async () => {
            if(selectedFile && selectedFile.url) return await parseSubToJson({ url: selectedFile.url, format: 'srt', mode: mode })
            else throw new Error("Couldn't get the file")
        },
        staleTime: Infinity,
        enabled: !!selectedFile?.url
    })

    useEffect(() => {
        if (filesData) {
            const filteredFiles = filterFiles(filesData);
            setFilteredFiles(filteredFiles);
            const selectedFile = selectFile(filteredFiles);
            setSelectedFile(selectedFile);
        }
    }, [filesData]);

    // Consolidated loading state
    const isLoading = isLoadingSearch || isLoadingFiles || isLoadingSubs;
    
    // Handle errors
    const hasError = searchError || filesError || subsError;
    const errorMessage = searchError?.message || filesError?.message || subsError?.message;

    useEffect(() => {
        refetch()
    }, [selectedFile, refetch])

    if (hasError) {
        return (
            <Indicator color="red" message={errorMessage || ""} type="error" />
        );
    }


    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-row justify-between items-center">
                <Button 
                    variant="ghost" 
                    className="flex w-fit items-center gap-1" 
                    onClick={() => router.back()}
                >
                    <ChevronLeft size={16} />
                    <span>Go Back</span>
                </Button>
                {selectedFile && !isLoading && (
                    <div className="flex flex-row gap-2">
                        <Button
                            onClick={() => router.push(selectedFile.url)}
                            size="sm"
                            variant='secondary'
                        >
                            Download File
                        </Button>
                        <Files 
                            files={filteredFiles}
                            setSelectedFile={setSelectedFile}
                            selectedFile={selectedFile}
                        />
                    </div>
                )}
            </div>
            <div>
                {/* Loading state displayed inline */}
                {(isLoadingSearch || isLoadingFiles) && <Indicator type="loading" color="white" message="Fetching Data..." />}
                {/* Show Dialogue component once we have the necessary data */}
                {selectedFile && (
                    <Dialogue
                        subs={subs}
                        mode={mode}
                        setMode={setMode}
                        isLoading={isLoadingSubs}
                    />
                )}
                {/* No files found state */}
                {(!isLoading && !selectedFile) && (
                    <Card className="w-full p-4 bg-yellow-50 border-yellow-200">
                        <CardContent className="p-0 text-center text-yellow-700">
                            <p>No subtitle files were found for this episode</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}