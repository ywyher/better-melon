import { Combobox } from "@/components/ui/combobox";
import { animeSources } from "@/lib/constants/anime";
import { parseAsStringEnum, useQueryState } from "nuqs";
import FilterField from "@/components/filters/filed";
import { AnilistSource } from "@better-melon/shared/types";

export default function SourceFilter() {
    const [source, setSource] = useQueryState<AnilistSource>('source',
        parseAsStringEnum<AnilistSource>(animeSources)
    )

    return (
        <FilterField label="Source">
            <Combobox
                options={animeSources}
                placeholder="Select source material"
                onChange={(e) => setSource((e ? e : null) as AnilistSource)}
                defaultValue={source || ""}
            />
        </FilterField>
    )
}