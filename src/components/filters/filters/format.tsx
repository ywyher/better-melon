import FilterField from "@/components/filters/filed";
import { Combobox } from "@/components/ui/combobox";
import { animeFormats } from "@/lib/constants/anime";
import { AnimeFormat } from "@/types/anime";
import { parseAsStringEnum, useQueryState } from "nuqs";

export default function FormatFilter() {
    const [format, setFormat] = useQueryState('format',
        parseAsStringEnum<AnimeFormat>(animeFormats)
    )

    return (
        <FilterField label="Format">
            {animeFormats && (
                <Combobox
                    options={animeFormats}
                    onChange={(e) => setFormat((e ? e : null) as AnimeFormat)}
                    placeholder="Select a format"
                    defaultValue={format || ""}
                />
            )}
        </FilterField>
    )
}