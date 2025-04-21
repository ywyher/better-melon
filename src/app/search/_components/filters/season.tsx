"use client"

import { Combobox } from "@/components/ui/combobox";
import { Dispatch, SetStateAction } from "react";
import { AnimeSeason } from "@/types/anime";
import { animeSeasons } from "@/lib/constants/anime";

export default function SeasonFilter({
    querySeason,
    setSeason
}: {
    querySeason: AnimeSeason | null
    setSeason: Dispatch<SetStateAction<AnimeSeason | null>>
}) {

    const data = [
        "Any season",
        ...animeSeasons
    ]

    return (
        <div className="w-full">
            {animeSeasons && (
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