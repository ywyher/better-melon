import DotSeparator from "@/components/dot-separator"
import { kanjidic2Reading } from "@/lib/constants/kanjidic2"
import { Fragment } from "react"
import type { Kanjidic2Reading } from "@/types/kanjidic2"

type Kanjidic2ReadingProps = {
  reading: Kanjidic2Reading[]
}

export default function Kanjidic2Reading({ reading }: Kanjidic2ReadingProps) {
  // Filter and group readings by type
  const filteredReadings = reading.filter(r => kanjidic2Reading.includes(r.type))
  
  // Group readings by type
  const groupedReadings = filteredReadings.reduce((acc, reading) => {
    if (!acc[reading.type]) {
      acc[reading.type] = []
    }
    acc[reading.type].push(reading.value)
    return acc
  }, {} as Record<string, string[]>)

  return (
    <div className="space-y-2">
      {Object.entries(groupedReadings).map(([type, values]) => (
        <div 
          key={type}
          className="flex flex-row gap-2 items-baseline"
        >
          <span className="text-lg font-medium capitalize">
            {type.replace("ja_", '')}:
          </span>
          <div className="flex flex-wrap items-center gap-1">
            {values.map((value: string, idx: number) => (
              <Fragment key={idx}>
                <span className="text-lg text-gray-300">{value}</span>
                {idx < values.length - 1 && <DotSeparator />}
              </Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}