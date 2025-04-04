"use client"

import { Dispatch, SetStateAction, useEffect } from "react";

export default function ScoreFilter({
    queryScore,
    setScore
}: {
    queryScore: number | null
    setScore: Dispatch<SetStateAction<number | null>>
}) {

    useEffect(() =>{ 
        setScore(1)
    }, [setScore])
    
    return (
        <div className="w-full">
            {queryScore}
        </div>
    )
}