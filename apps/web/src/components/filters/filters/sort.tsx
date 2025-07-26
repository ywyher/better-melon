import FilterField from "@/components/filters/filed";
import MultipleSelector from "@/components/multiple-selector";
import { animeSort } from "@/lib/constants/anime";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";

export default function SortFilter() {
    const [sort, setSort] = useQueryState('sort', parseAsArrayOf(parseAsString))

    return (
        <FilterField label="Sort">
            <MultipleSelector 
                options={animeSort.map((sort) => {
                    return {
                        value: sort,
                        label: sort.charAt(0).toUpperCase() + sort.slice(1)
                    }
                })}
                placeholder="Select Sorting Option(s)"
                onChange={(selections) => {
                    const selectedValues = selections.map((selection) => selection.value);
                    setSort(selectedValues ? selectedValues : null);
                }}
                value={sort?.map((sort) => {
                    return {
                        value: sort,
                        label: sort.charAt(0).toUpperCase() + sort.slice(1)
                    }
                }) || []}
            />
        </FilterField>
    );
}