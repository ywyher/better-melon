import EpisodeDetailsHeader from "@/app/watch/[id]/[ep]/components/episode/details/header/header"
import StreamingDetailsSkeleton from "@/app/watch/[id]/[ep]/components/episode/details/skeleton";
import { Card, CardContent, CardDescription } from "@/components/ui/card"
import { useStreamingStore } from "@/lib/stores/streaming-store"
   
export default function EpisodeDetails() {
  const episode = useStreamingStore((state) => state.streamingData?.episode)
   
  if(!episode) return <StreamingDetailsSkeleton />;

  return (
    <Card className="flex flex-col gap-3 bg-secondary py-3">
      <EpisodeDetailsHeader />
      <CardContent>
        <CardDescription
          className="bg-accent p-2 rounded-sm border-primary/20 border-1 w-fit"
        >
          {episode.details.attributes.description}
        </CardDescription>
      </CardContent>
    </Card>
  )
}  