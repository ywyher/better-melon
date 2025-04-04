"use client"

import { Combobox } from "@/components/ui/combobox";
import { Dispatch, SetStateAction } from "react";

export default function YearFilter({
    queryYear,
    setYear
}: {
    queryYear: string | null
    setYear: Dispatch<SetStateAction<string | null>>
}) {
    const allYears = Array.from({ length: new Date().getFullYear() - 1940 + 1 }, (_, i) => (new Date().getFullYear() - i).toString());

    const years = [
        "Any year",
        ...allYears
    ]
    
    return (
        <div className="w-full">
            {years && (
                <Combobox
                    options={years}
                    onChange={(e) => {
                        if(e != 'Any year') setYear(e)
                            else setYear(null)
                    }}
                    placeholder="select a year"
                    defaultValue={queryYear || ""}
                />
            )}
        </div>
    )
}