import useEpisodesMetadata from "@/lib/hooks/use-episodes-metadata"
import { useUIStateStore } from "@/lib/stores/ui-state-store"
import { Anime } from "@/types/anime"
import { useCallback, useMemo, useState } from "react"

type UseEpisodesListProps = {
  animeId: Anime['id']
}

const chunkSize = 100;

export default function useEpisodesList({ animeId }: UseEpisodesListProps) {
  const [filterText, setFilterText] = useState("");
  const [selectedChunk, setSelectedChunk] = useState("1-100");

  const episodesListViewMode = useUIStateStore((state) => state.episodesListViewMode);
  const setEpisodesListViewMode = useUIStateStore((state) => state.setEpisodesListViewMode);
  const episodesListSpoilerMode = useUIStateStore((state) => state.episodesListSpoilerMode);
  const setEpisodesListSpoilerMode = useUIStateStore((state) => state.setEpisodesListSpoilerMode);

  const [start, end] = useMemo(() => {
    return selectedChunk.split("-").map(Number)
  }, [selectedChunk]);
  
  const { data: { count, episodes: rawEpisodes }, isLoading } = useEpisodesMetadata({ 
    animeId,
    limit: 100,
    offset: start - 1,
  })

  const episodes = useMemo(() => {
    return rawEpisodes?.filter(episode => {
      const matchesText = filterText === "" ||
        episode.attributes.number.toString().includes(filterText) || 
        (episode.attributes.canonicalTitle?.toLowerCase().includes(filterText.toLowerCase()));
      
      const [start, end] = selectedChunk.split("-").map(Number);
      const inChunk = episode.attributes.number >= start && episode.attributes.number <= end;
      
      return matchesText && inChunk;
    });
  }, [rawEpisodes, filterText, selectedChunk]);

  const chunks = useMemo(() => {
    if (!count || count < chunkSize) return null;
    
    const totalChunks = Math.ceil(count / chunkSize);
    return Array.from({ length: totalChunks }, (_, i) => {
      const start = i * chunkSize + 1;
      const end = Math.min((i + 1) * chunkSize, count);
      return {
        value: `${start}-${end}`,
        label: `${start}-${end}`
      };
    });
  }, [rawEpisodes]);

  const cycleViewMode = useCallback(() => {
    if (episodesListViewMode === "grid") {
      setEpisodesListViewMode("list");
    } else if (episodesListViewMode === "list") {
      setEpisodesListViewMode("image");
    } else {
      setEpisodesListViewMode("grid");
    }
  }, [episodesListViewMode]);

  return {
    episodes,
    isLoading,

    filterText,
    setFilterText,
    
    selectedChunk,
    setSelectedChunk,
    
    chunks,

    cycleViewMode,   

    episodesListViewMode,

    episodesListSpoilerMode,
    setEpisodesListSpoilerMode,
  }
}