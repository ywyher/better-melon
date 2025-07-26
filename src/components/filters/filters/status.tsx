import FilterField from "@/components/filters/filed";
import { Combobox } from "@/components/ui/combobox";
import { animeStatuses } from "@/lib/constants/anime";
import { AnimeStatus } from "@/types/anime";
import { parseAsStringEnum, useQueryState } from "nuqs";

export default function StatusFilter() {
    const [status, setStatus] = useQueryState('status',
        parseAsStringEnum<AnimeStatus>(animeStatuses)
    )

    return (
        <FilterField label="Status">
            <Combobox
                options={animeStatuses}
                placeholder="Select a status"
                onChange={(e) => setStatus((e ? e : null) as AnimeStatus | null)}
                defaultValue={status || ""}
            />
        </FilterField>
    )
}