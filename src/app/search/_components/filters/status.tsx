"use client"

import { Combobox } from "@/components/ui/combobox";
import { statuses } from "@/lib/constants";
import { Dispatch, SetStateAction } from "react";
import { AnimeStatus } from "@/types/anime";

export default function StatusFilter({
    queryStatus,
    setStatus
}: {
    queryStatus: AnimeStatus | null
    setStatus: Dispatch<SetStateAction<AnimeStatus | null>>
}) {

    const data = [
        "Any status",
        ...statuses
    ]

    return (
        <div className="w-full">
            {statuses && (
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