"use client"

import { Combobox } from "@/components/ui/combobox";
import { Dispatch, SetStateAction } from "react";
import { AnimeStatus } from "@/types/anime";
import { animeStatuses } from "@/lib/constants/anime";

export default function StatusFilter({
    queryStatus,
    setStatus
}: {
    queryStatus: AnimeStatus | null
    setStatus: Dispatch<SetStateAction<AnimeStatus | null>>
}) {

    const data = [
        "Any status",
        ...animeStatuses
    ]

    return (
        <div className="w-full">
            {animeStatuses && (
                <Combobox
                    options={data}
                    placeholder="Select a status"
                    onChange={(e) => {
                        if(e != 'Any status') setStatus(e as AnimeStatus)
                            else setStatus(null)
                    }}
                    defaultValue={queryStatus || ""}
                />
            )}
        </div>
    )
}