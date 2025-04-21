"use client"

import MultipleSelector from "@/components/multiple-selector";
import { animeSort } from "@/lib/constants/anime";
import { Dispatch, SetStateAction, useEffect } from "react";

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
    }, [querySort, setSort])

    return (
        <div className="w-full">
            {animeSort && (
                <MultipleSelector 
                    options={animeSort.map((sort) => {
                        return {
                            value: sort,
                            label: sort.charAt(0).toUpperCase() + sort.slice(1)
                        }
                    })}
                    placeholder="Select Sorting Option(s)"
                    onChange={(selections) => {
                        const selectedValues = selections.map((selection) => selection.value);
                        setSort(selectedValues);
                      }}
                    value={sort?.map((sort) => {
                        return {
                            value: sort,
                            label: sort.charAt(0).toUpperCase() + sort.slice(1)
                        }
                    })}
                />
            )}
        </div>
    );
}