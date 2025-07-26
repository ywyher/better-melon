import FilterField from "@/components/filters/filed";
import MultipleSelector from "@/components/multiple-selector";
import { animeTags } from "@/lib/constants/anime";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";

export default function TagsFilter() {
    const [tags, setTags] = useQueryState('tags', parseAsArrayOf(parseAsString))

    return (
        <FilterField label="Genres">
            <MultipleSelector 
                options={animeTags.map((tag) => {
                    return {
                        value: tag,
                        label: tag.charAt(0).toUpperCase() + tag.slice(1)
                    }
                })}
                placeholder="Select Tags"
                onChange={(selections) => {
                    const selectedValues = selections.map((selection) => selection.value);
                    setTags(selectedValues ? selectedValues : null);
                }}
                value={tags?.map((tag) => {
                    return {
                        value: tag,
                        label: tag.charAt(0).toUpperCase() + tag.slice(1)
                    }
                }) || []}
            />
        </FilterField>
    );
}