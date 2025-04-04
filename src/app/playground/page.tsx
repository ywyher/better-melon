"use client"

import { vttEn } from "@/lib/constants"
import { parseSubtitleToJson } from "@/lib/fetch-subs"
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"

export default function Playground() {
    const { data } = useQuery({
        queryKey: ['subs'],
        queryFn: async () => {
            return await parseSubtitleToJson({ 
                url: vttEn, 
                format: 'vtt',
                script: 'english'
            })
        },
        staleTime: Infinity,
    })

    useEffect(() => {
        console.log(`local`)
        console.log(data)
    }, [data])

    return (
        <>Playground</>
    )
}