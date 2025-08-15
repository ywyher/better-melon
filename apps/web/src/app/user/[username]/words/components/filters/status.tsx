import { Word } from "@/lib/db/schema";
import { Combobox } from "@/components/ui/combobox";
import { wordStatuses } from "@/lib/constants/word";
import { parseAsStringEnum, useQueryState } from "nuqs";

export default function ProfileWordsStatusFilter() {
  const [status, setStatus] = useQueryState('status',
    parseAsStringEnum<Word['status']>(wordStatuses)
  )

  const options = [
    {
      label: "Any",
      value: 'any'
    },
    ...wordStatuses.map(s => {
      return {
        label: s,
        value: s
      }
    }),
  ]
  
  return (
    <Combobox
      options={options}
      onChange={(v) => {
        if(v == 'any') {
          setStatus((null))
        } else {
          setStatus((v ? v : null) as Word['status'])
        }
      }}
      placeholder="Search a status"
      defaultValue={status || ""}
      className="bg-secondary"
    />
  )
}