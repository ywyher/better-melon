"use client"

import { Combobox } from "@/components/ui/combobox";
import { seasons } from "@/lib/constants";
import { Dispatch, SetStateAction } from "react";
import { AnimeSeason } from "@/types/anime";

export default function SeasonFilter({
    querySeason,
    setSeason
}: {
    querySeason: AnimeSeason | null
    setSeason: Dispatch<SetStateAction<AnimeSeason | null>>
}) {

    const data = [
        "Any season",
        ...seasons
    ]

    return (
        <div className="w-full">
            {seasons && (
                <Combobox
                    options={data}
                    placeholder="Select a season"
                    onChange={(e) => {
                        if(e != 'Any season') setSeason(e as AnimeSeason)
                            else setSeason(null)
                    }}
                    defaultValue={querySeason || ""}
                />
            )}
        </div>
    )
}