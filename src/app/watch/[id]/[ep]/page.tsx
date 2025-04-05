import Player from "@/app/watch/[id]/[ep]/_components/player/player";
import { SubtitleFile } from "@/types/subtitle";
import { AnimeEpisodeData } from "@/types/anime";
import WatchContainer from "@/app/watch/[id]/[ep]/_components/watch-container";

type Params = Promise<{ id: string, ep: string }>

export default async function Watch({ params }: { params: Params }) {
  const { id, ep } = await params;
  const episodeNumber = parseInt(ep);

  try {
    const episodesData = await fetch(`${process.env.NEXT_PUBLIC_CONSUMET_URL}/meta/anilist/episodes/${id}?provider=zoro`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch episodes data");
        return res.json();
      }) as AnimeEpisodeData[];

    const episode = episodesData.find((episode: AnimeEpisodeData) => episode.number === episodeNumber) as AnimeEpisodeData;
    
    if (!episode) {
      return <div className="container mx-auto px-4 py-6 text-center">Episode not found</div>;
    }

    const [streamingData, subtitleEntries] = await Promise.all([
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

    if (subtitleEntries.length === 0) {
      return (
        <div className="container mx-auto px-4 py-6">
          <Player episode={episode} streamingData={streamingData} subtitleFiles={[]} />
        </div>
      );
    }

    const subtitleFiles = await fetch(`https://jimaku.cc/api/entries/${subtitleEntries[0].id}/files?episode=${ep}`, {
      headers: { Authorization: `${process.env.JIMAKU_KEY}` },
    }).then((res) => {
      if (!res.ok) throw new Error("Failed to fetch Japanese subtitles");
      return res.json();
    }) as SubtitleFile[];

    return (
      <WatchContainer
        episode={episode}
        streamingData={streamingData}
        subtitleFiles={subtitleFiles}
        episodesLength={episodesData.length}
      />
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return <div className="container mx-auto px-4 py-6 text-center">Error loading content: {(error as Error).message}</div>;
  }
}