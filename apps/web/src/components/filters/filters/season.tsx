import FilterField from "@/components/filters/filed";
import { Combobox } from "@/components/ui/combobox";
import { animeSeasons } from "@/lib/constants/anime";
import { AnilistSeason } from "@better-melon/shared/types";
import { parseAsStringEnum, useQueryState } from "nuqs";

export default function SeasonFilter() {
    const [season, setSeason] = useQueryState('season',
        parseAsStringEnum<AnilistSeason>(animeSeasons)
    )

    return (
        <FilterField label="Season">
            {animeSeasons && (
                <Combobox
                    options={animeSeasons}
                    placeholder="Select a season"
                    onChange={(e) => {
                        setSeason((e ? e : null) as AnilistSeason | null)
                    }}
                    defaultValue={season || ""}
                />
            )}
        </FilterField>
    )
}