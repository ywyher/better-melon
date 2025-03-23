"use client"

import { Combobox } from "@/components/ui/combobox";
import { countries } from "@/lib/constants";
import { Dispatch, SetStateAction } from "react";
import { AnimeCountry } from "@/types/anime";

export default function CountryFilter({
    queryCountry,
    setCountry
}: {
    queryCountry: AnimeCountry | null
    setCountry: Dispatch<SetStateAction<AnimeCountry | null>>
}) {

    const data = [
        {
            value: "ANY",
            label: "Any country"
        },
        ...countries.map((country) => {
            return {
                value: country.value,
                label: country.label
            }
        })
    ]

    return (
        <div className="w-full">
            {countries && (
                <Combobox
                    options={data}
                    placeholder="Select a country"
                    onChange={(e) => {
                        if(e != 'ANY') setCountry(e as AnimeCountry)
                            else setCountry(null)
                    }}
                    defaultValue={queryCountry || ""}
                />
            )}
        </div>
    )
}