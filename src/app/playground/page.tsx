"use client"

import { Input } from "@/components/ui/input"
import { parseSubtitleToJson } from "@/lib/fetch-subs"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"

export default function Playground() {
    const [file, setFile] = useState<File | null>(null)

    const { data } = useQuery({
        queryKey: ['subs'],
        queryFn: async () => {
            if(!file) return;
            return await parseSubtitleToJson({ 
                source: file, 
                format: 'vtt',
                script: 'english'
            })
        },
        staleTime: Infinity,
        enabled: !!file
    })

    useEffect(() => {
        console.log(data)
    }, [data])

    return (
        <>
            <Input
                name="file"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept=".srt,.vtt"
            />
        </>
    )
}