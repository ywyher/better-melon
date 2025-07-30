import FilterField from "@/components/filters/filed";
import { Combobox } from "@/components/ui/combobox";
import { parseAsBoolean, useQueryState } from "nuqs";

export default function IsAdultFilter() {
    const [isAdult, setIsAdult] = useQueryState<boolean>('isAdult', parseAsBoolean)

    const options = [
        "Adult",
        "Non-Adult"
    ]

    return (
        <FilterField label="Adult Content">
            {options && (
                <Combobox
                    options={options}
                    onChange={(e) => setIsAdult(e == 'Adult' ? true : null)}
                    placeholder="select a adult"
                    defaultValue={isAdult ? "Adult" : "Non-Adult"}
                />
            )}
        </FilterField>
    )
}