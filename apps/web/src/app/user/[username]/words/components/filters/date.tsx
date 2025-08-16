import { DatePicker } from "@/components/form/date-picker";
import { normalizeDateToUTC } from "@/lib/utils/utils";
import { dateRangeSchema } from "@/types";
import { parseAsJson, useQueryState } from "nuqs";
import { useEffect, useState } from "react";

export default function ProfileWordsDateFilter() {
  const [date, setDate] = useQueryState('date', parseAsJson(dateRangeSchema.parse))
  const [value, setValue] = useState<{
    from?: Date
    to?: Date
  }>({
    from: undefined,
    to: undefined
  })

  useEffect(() => {
    setValue({
      from: date?.from ? new Date(date?.from) : undefined,
      to: date?.to ? new Date(date?.to) : undefined,
    })
  }, [date])

  return (
    <DatePicker 
      className="flex-1 w-full bg-secondary"
      mode="range"
      value={{
        from: value.from ? new Date(value?.from) : undefined,
        to: value.to ? new Date(value?.to) : undefined,
      }}
      onChange={(v) => {
        if(!v?.from || !v?.to) return;
        console.log(v)
        setDate({
          from: normalizeDateToUTC(v.from, 'string') as string,
          to: normalizeDateToUTC(v.to, 'string') as string
        })
      }}
    />
  )
}