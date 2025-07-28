import FilterField from "@/components/filters/filed";
import { Combobox } from "@/components/ui/combobox";
import { animeFormats } from "@/lib/constants/anime";
import { AnilistFormat } from "@better-melon/shared/types";
import { parseAsStringEnum, useQueryState } from "nuqs";

export default function FormatFilter() {
    const [format, setFormat] = useQueryState('format',
        parseAsStringEnum<AnilistFormat>(animeFormats)
    )

    return (
        <FilterField label="Format">
            {animeFormats && (
                <Combobox
                    options={animeFormats}
                    onChange={(e) => setFormat((e ? e : null) as AnilistFormat)}
                    placeholder="Select a format"
                    defaultValue={format || ""}
                />
            )}
        </FilterField>
    )
}