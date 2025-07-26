import { Combobox } from "@/components/ui/combobox";
import { AnimeCountry } from "@/types/anime";
import { animeCountries } from "@/lib/constants/anime";
import { parseAsStringEnum, useQueryState } from "nuqs";
import FilterField from "@/components/filters/filed";

export default function CountryFilter() {
    const [country, setCountry] = useQueryState<AnimeCountry>('country',
        parseAsStringEnum<AnimeCountry>(animeCountries.map(a => a.value))
    )

    return (
        <FilterField
            label="Country Of Origin"
        >
            <Combobox
                options={animeCountries}
                placeholder="Select a country"
                onChange={(e) => setCountry((e ? e : null) as AnimeCountry | null)}
                defaultValue={country || ""}
            />
        </FilterField>
    )
}