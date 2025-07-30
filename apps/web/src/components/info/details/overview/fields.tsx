'use client'

import { convertFuzzyDateToDate } from "@/lib/utils/utils"
import { Anime, AnimeDetails } from "@/types/anime"
import { format } from "date-fns"

type DetailsOverviewProps = {
  anime: AnimeDetails
}

const overviewFields: {
  label: string
  value: (anime: Anime) => string | number | undefined
}[] = [
  { label: "format", value: (anime) => anime.format },
  { label: "episodes", value: (anime) => anime.episodes },
  { label: "duraiton", value: (anime) => anime.duration },
  { label: "season", value: (anime) => anime.season },
  { label: "studios", value: (anime) => anime.studios.edges.find(e => e.isMain)?.node.name },
  { label: "aired", value: (anime) => {
    const startDate = convertFuzzyDateToDate(anime.startDate)
    const endDate = convertFuzzyDateToDate(anime.endDate)

    const startStr = startDate ? format(startDate, "MMM-d-yyyy") : "?"
    const endStr = endDate ? format(endDate, "MMM-d-yyyy") : "?"

    return `${startStr} to ${endStr}`
  } },
]

export default function DetailsOverviewFields({ anime }: DetailsOverviewProps) {
  return (
    <div className="grid grid-cols-12 space-y-6">
      {overviewFields.map((field, index) => (
        <div key={index} className="flex flex-col gap-1 w-fit col-span-3">
          <div className="text-xs text-muted-foreground uppercase">{field.label}</div>
          <div className="text-sm font-medium text-primary">
            {anime ? field.value(anime) ?? "—" : "—"}
          </div>
        </div>
      ))}
    </div>
  )
}