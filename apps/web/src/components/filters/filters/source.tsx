import { Combobox } from "@/components/ui/combobox";
import { AnimeSource } from "@/types/anime";
import { animeSources } from "@/lib/constants/anime";
import { parseAsStringEnum, useQueryState } from "nuqs";
import FilterField from "@/components/filters/filed";

export default function SourceFilter() {
    const [source, setSource] = useQueryState<AnimeSource>('source',
        parseAsStringEnum<AnimeSource>(animeSources)
    )

    return (
        <FilterField label="Source">
            <Combobox
                options={animeSources}
                placeholder="Select source material"
                onChange={(e) => setSource((e ? e : null) as AnimeSource)}
                defaultValue={source || ""}
            />
        </FilterField>
    )
}