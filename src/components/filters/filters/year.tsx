import FilterField from "@/components/filters/filed";
import { Combobox } from "@/components/ui/combobox";
import { useQueryState } from "nuqs";

export default function YearFilter() {
    const [year, setYear] = useQueryState('year')
    const years = Array.from({ length: new Date().getFullYear() - 1940 + 1 }, (_, i) => (new Date().getFullYear() - i).toString());
    
    return (
        <FilterField label="Year">
            {years && (
                <Combobox
                    options={years}
                    onChange={(e) => setYear(e ? e : null)}
                    placeholder="select a year"
                    defaultValue={year || ""}
                />
            )}
        </FilterField>
    )
}