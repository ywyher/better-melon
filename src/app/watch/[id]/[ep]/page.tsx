import Video from "@/app/watch/[id]/[ep]/_components/video";
import { StreamingData } from "@/app/watch/[id]/[ep]/types";

type Params = Promise<{ id: string, ep: string }>

export default async function Watch({ params }: { params: Params }) {
  const { id, ep } = await params;
  
  const episodeResponse = await fetch(`${process.env.CONSUMET_API}/meta/anilist/episodes/${id}?provider=zoro`);
  const episodeData = await episodeResponse.json();
  
  const episode = episodeData.find((episode: any) => episode.number === parseInt(ep));
  const episodeId = episode?.id;
  
  const streamingResponse = await fetch(`${process.env.CONSUMET_API}/meta/anilist/watch/${episodeId}?provider=zoro`);
  const streamingData = await streamingResponse.json() as StreamingData;

  return (
    <div className="container mx-auto px-4 py-6">
      <Video data={streamingData} />
    </div>
  );
}