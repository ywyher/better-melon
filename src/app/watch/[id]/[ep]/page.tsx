import Player from "@/app/watch/[id]/[ep]/_components/player";
import Subs from "@/app/watch/[id]/[ep]/_components/subs";
import { filterFiles } from "@/app/watch/[id]/[ep]/funcs";
import { JimakuFile } from "@/app/watch/[id]/[ep]/types";

type Params = Promise<{ id: string, ep: string }>

export default async function Watch({ params }: { params: Params }) {
  const { id, ep } = await params;
  const epNumber = parseInt(ep);

  try {
    const episodesData = await fetch(`${process.env.NEXT_PUBLIC_CONSUMET_URL}/meta/anilist/episodes/${id}?provider=zoro`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch episodes data");
        return res.json();
      });

    const episode = episodesData.find((episode: any) => episode.number === epNumber);
    
    if (!episode) {
      return <div className="container mx-auto px-4 py-6 text-center">Episode not found</div>;
    }

    const [streamingData, jimakuEntry] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_CONSUMET_URL}/meta/anilist/watch/${episode.id}?provider=zoro`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch streaming data");
          return res.json();
        }),
      fetch(`https://jimaku.cc/api/entries/search?anilist_id=${id}`, {
        headers: { Authorization: `${process.env.JIMAKU_KEY}` },
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch subtitle entries");
        return res.json();
      })
    ]);

    if (jimakuEntry.length === 0) {
      return (
        <div className="container mx-auto px-4 py-6">
          <Player episodeData={episode} streamingData={streamingData} japaneseSubs={[]} />
        </div>
      );
    }

    const japaneseSubs = await fetch(`https://jimaku.cc/api/entries/${jimakuEntry[0].id}/files?episode=${ep}`, {
      headers: { Authorization: `${process.env.JIMAKU_KEY}` },
    }).then((res) => {
      if (!res.ok) throw new Error("Failed to fetch Japanese subtitles");
      return res.json();
    }) as JimakuFile[];

    return (
      <div className="flex flex-row gap-10 container mx-auto px-4 py-6">
        <Player episodeData={episode} streamingData={streamingData} japaneseSubs={japaneseSubs} />
        {japaneseSubs && (
          <Subs filesData={filterFiles(japaneseSubs)} />
        )}
      </div>
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return <div className="container mx-auto px-4 py-6 text-center">Error loading content: {(error as Error).message}</div>;
  }
}