import { Combobox } from "@/components/ui/combobox";
import { Dispatch, SetStateAction } from "react";

export default function IsAdultFilter({
    queryIsAdult,
    setIsAdult
}: {
    queryIsAdult: boolean | null
    setIsAdult: Dispatch<SetStateAction<boolean | null>>
}) {
    const options = [
        "Any content",
        "Adult",
        "Non-Adult"
    ]

    return (
        <div className="w-full">
            {options && (
                <Combobox
                    options={options}
                    onChange={(e) => {
                        if(e != 'Any content') setIsAdult(e == 'Adult' ? true : false)
                            else setIsAdult(null)
                    }}
                    placeholder="select a adult"
                    defaultValue={!queryIsAdult ? 'Any content' : ((queryIsAdult ? "Adult" : "Non-Adult" ))  }
                />
            )}
        </div>
    )
}