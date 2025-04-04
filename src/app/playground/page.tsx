"use client"

import { vtt } from "@/lib/constants"
import { parseSubtitleToJson } from "@/lib/fetch-subs"
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"

export default function Playground() {
    const { data } = useQuery({
        queryKey: ['subs'],
        queryFn: async () => {
            return await parseSubtitleToJson({ 
                url: vtt, 
                format: 'vtt',
            })
        },
        staleTime: Infinity,
    })

    useEffect(() => {
        console.log(data)
    }, [data])

    return (
        <>Playground</>
    )
}