"use client"

import { Combobox } from "@/components/ui/combobox";
import { sources } from "@/lib/constants";
import { Dispatch, SetStateAction } from "react";
import { AnimeSource } from "@/types/anime";

export default function SourceFilter({
    querySource,
    setSource
}: {
    querySource: AnimeSource | null
    setSource: Dispatch<SetStateAction<AnimeSource | null>>
}) {

    const data = [
        "Any source",
        ...sources
    ]

    return (
        <div className="w-full">
            {sources && (
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