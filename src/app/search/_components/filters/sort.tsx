"use client"

import MultipleSelector from "@/components/multiple-selector";
import { Dispatch, SetStateAction, useEffect } from "react";
import { sort as data } from "@/lib/constants";

export default function SortFilter({
    querySort,
    sort,
    setSort
}: {
    querySort: string[] | null
    sort: string[] | null,
    setSort: Dispatch<SetStateAction<string[] | null>>
}) {
    useEffect(() => {
        if(querySort?.length) {
            setSort(querySort)
        }
    }, [querySort])

    return (
        <div className="w-full">
            {data && (
                <MultipleSelector 
                    options={data.map((srt) => {
                        return {
                            value: srt,
                            label: srt.charAt(0).toUpperCase() + srt.slice(1)
                        }
                    })}
                    placeholder="Select Sorting Option(s)"
                    onChange={(selections) => {
                        const selectedValues = selections.map((selection) => selection.value);
                        setSort(selectedValues);
                      }}
                    value={sort?.map((srt) => {
                        return {
                            value: srt,
                            label: srt.charAt(0).toUpperCase() + srt.slice(1)
                        }
                    })}
                />
            )}
        </div>
    );
}