'use client'

import EpisodeDetailsHistory from "@/app/watch/[id]/[ep]/components/episode/details/header/history";
import AddToList from "@/components/add-to-list/add-to-list";
import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { useStreamingStore } from "@/lib/stores/streaming-store";
import { format } from "date-fns";

export default function EpisodeDetailsHeader() {
  const animeId = useStreamingStore((state) => state.animeId) || 20661
  const episodeNumber = useStreamingStore((state) => state.episodeNumber)
  const episode = useStreamingStore((state) => state.streamingData?.episode)

  if(!episode) return;

  return (
    <CardHeader className="flex flex-row justify-between items-center">
      <CardTitle>
        {episodeNumber}. {episode.details.attributes.canonicalTitle}
      </CardTitle>
      <div className="flex flex-row gap-2">
        {episode.details.attributes.airdate && (
          <Badge variant='outline'>
            {format(new Date(episode.details.attributes.airdate), "MMM dd, yyyy")}
          </Badge>
        )}
        <EpisodeDetailsHistory />
        <AddToList
          animeId={animeId}
        />
      </div>
    </CardHeader>
  )
}