"use client"

import { Combobox } from "@/components/ui/combobox";
import { formats } from "@/lib/constants";
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
        ...formats
    ]

    return (
        <div className="w-full">
            {formats && (
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