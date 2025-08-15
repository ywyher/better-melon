import FilterField from "@/components/filters/filed";
import { Combobox } from "@/components/ui/combobox";
import { animeCountries } from "@/lib/constants/anime";
import { AnilistCountry } from "@/types/anilist/anime";
import { parseAsStringEnum, useQueryState } from "nuqs";

export default function CountryFilter() {
    const [country, setCountry] = useQueryState<AnilistCountry>('country',
        parseAsStringEnum<AnilistCountry>(animeCountries.map(a => a.value))
    )

    return (
        <FilterField
            label="Country Of Origin"
        >
            <Combobox
                options={animeCountries}
                placeholder="Select a country"
                onChange={(e) => setCountry((e ? e : null) as AnilistCountry | null)}
                defaultValue={country || ""}
            />
        </FilterField>
    )
}