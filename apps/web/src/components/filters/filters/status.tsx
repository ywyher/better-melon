import FilterField from "@/components/filters/filed";
import { Combobox } from "@/components/ui/combobox";
import { animeStatuses } from "@/lib/constants/anime";
import { AnilistStatus } from "@better-melon/shared/types";
import { parseAsStringEnum, useQueryState } from "nuqs";

export default function StatusFilter() {
    const [status, setStatus] = useQueryState('status',
        parseAsStringEnum<AnilistStatus>(animeStatuses)
    )

    return (
        <FilterField label="Status">
            <Combobox
                options={animeStatuses}
                placeholder="Select a status"
                onChange={(e) => setStatus((e ? e : null) as AnilistStatus | null)}
                defaultValue={status || ""}
            />
        </FilterField>
    )
}