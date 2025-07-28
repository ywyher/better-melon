import FilterField from "@/components/filters/filed";
import MultipleSelector from "@/components/multiple-selector";
import { animeSorts } from "@/lib/constants/anime";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";

export default function SortsFilter() {
    const [sorts, setSorts] = useQueryState('sorts', parseAsArrayOf(parseAsString))

    return (
        <FilterField label="Sorts">
            <MultipleSelector 
                options={animeSorts.map((sort) => {
                    return {
                        value: sort,
                        label: sort.charAt(0).toUpperCase() + sort.slice(1)
                    }
                })}
                placeholder="Select Sorting Option(s)"
                onChange={(selections) => {
                    const selectedValues = selections.map((selection) => selection.value);
                    setSorts(selectedValues ? selectedValues : null);
                }}
                value={sorts?.map((sort) => {
                    return {
                        value: sort,
                        label: sort.charAt(0).toUpperCase() + sort.slice(1)
                    }
                }) || []}
            />
        </FilterField>
    );
}