"use client"

import { Combobox } from "@/components/ui/combobox";
import { animeFormats } from "@/lib/constants/anime";
import { AnimeFormat } from "@/types/anime";
import { Dispatch, SetStateAction } from "react";

export default function FormatFilter({
    queryFormat,
    setFormat
}: {
    queryFormat: AnimeFormat | null
    setFormat: Dispatch<SetStateAction<AnimeFormat | null>>
}) {

    const data = [
        "Any format",
        ...animeFormats
    ]

    return (
        <div className="w-full">
            {animeFormats && (
                <Combobox
                    options={data}
                    onChange={(e) => {
                        if(e != 'Any format') setFormat(e as AnimeFormat)
                            else setFormat(null)
                    }}
                    placeholder="Select a format"
                    defaultValue={queryFormat || ""}
                />
            )}
        </div>
    )
}