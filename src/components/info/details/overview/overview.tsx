'use client'

import GenreTags from "@/components/genre-tags"
import DetailsOverviewFields from "@/components/info/details/overview/fields"
import { removeHtmlTags } from "@/lib/utils/subtitle"
import { Anime } from "@/types/anime"

type DetailsOverviewProps = {
  anime: Anime
}

export default function DetailsOverview({ anime }: DetailsOverviewProps) {
  return (
    <div className="flex flex-col gap-10">
      <GenreTags genres={anime.genres} />
      <DetailsOverviewFields anime={anime} />
      <div className="text-muted-foreground -mt-8">
        {removeHtmlTags(anime.description)}
      </div>
    </div>
  )
}