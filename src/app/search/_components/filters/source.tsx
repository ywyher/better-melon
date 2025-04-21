"use client"

import { Combobox } from "@/components/ui/combobox";
import { Dispatch, SetStateAction } from "react";
import { AnimeSource } from "@/types/anime";
import { animeSources } from "@/lib/constants/anime";

export default function SourceFilter({
    querySource,
    setSource
}: {
    querySource: AnimeSource | null
    setSource: Dispatch<SetStateAction<AnimeSource | null>>
}) {

    const data = [
        "Any source",
        ...animeSources
    ]

    return (
        <div className="w-full">
            {animeSources && (
                <Combobox
                    options={data}
                    placeholder="Select source material"
                    onChange={(e) => {
                        if(e != 'Any source') setSource(e as AnimeSource)
                            else setSource(null)
                    }}
                    defaultValue={querySource || ""}
                />
            )}
        </div>
    )
}