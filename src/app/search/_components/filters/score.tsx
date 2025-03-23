"use client"

import { Combobox } from "@/components/ui/combobox";
import { Dispatch, SetStateAction } from "react";

export default function ScoreFilter({
    queryScore,
    setScore
}: {
    queryScore: number | null
    setScore: Dispatch<SetStateAction<number | null>>
}) {
    return (
        <div className="w-full">
        </div>
    )
}