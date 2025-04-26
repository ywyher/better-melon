"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Anime, AnimeEpisodeMetadata } from "@/types/anime";
import { Grid, List, Image as ImageIcon, Eye, EyeOff, Search } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import GridView from "@/app/watch/[id]/[ep]/_components/episodes/grid-view";
import ListView from "@/app/watch/[id]/[ep]/_components/episodes/list-view";
import ImageView from "@/app/watch/[id]/[ep]/_components/episodes/image-view";
import { usePlayerStore } from "@/lib/stores/player-store";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo, useCallback, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

export default function EpisodesList({ 
    episodesMetadata,
    animeData
  }: { 
    episodesMetadata: AnimeEpisodeMetadata[] 
    animeData: Anime
  }) {
  const params = useParams<{ id: string, ep: string }>();
  const episodesListViewMode = usePlayerStore((state) => state.episodesListViewMode);
  const setEpisodesListViewMode = usePlayerStore((state) => state.setEpisodesListViewMode);
  const episodesListSpoilerMode = usePlayerStore((state) => state.episodesListSpoilerMode);
  const setEpisodesListSpoilerMode = usePlayerStore((state) => state.setEpisodesListSpoilerMode);
  const router = useRouter();
  const currentEpisode = Number(params.ep);
  const [filterText, setFilterText] = useState("");
  const [selectedChunk, setSelectedChunk] = useState("all");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
      count: episodesMetadata?.length || 0,
      getScrollElement: () => scrollAreaRef.current,
      estimateSize: useCallback(() => 60, []),
      overscan: 10,
      measureElement: useCallback((element: Element) => {
          return element.getBoundingClientRect().height || 60;
      }, [])
  });

  const chunkSize = 100;
  const chunks = useMemo(() => {
    if (episodesMetadata.length <= chunkSize) return null;
    
    const totalChunks = Math.ceil(episodesMetadata.length / chunkSize);
    return Array.from({ length: totalChunks }, (_, i) => {
      const start = i * chunkSize + 1;
      const end = Math.min((i + 1) * chunkSize, episodesMetadata.length);
      return {
        value: `${start}-${end}`,
        label: `${start}-${end}`
      };
    });
  }, [episodesMetadata.length]);

  const filteredEpisodes = useMemo(() => {
    return episodesMetadata.filter(episode => {
      const matchesText = filterText === "" || 
        episode.number.toString().includes(filterText) || 
        (episode.title?.toLowerCase().includes(filterText.toLowerCase()));
      
      if (selectedChunk === "all") return matchesText;
      
      const [start, end] = selectedChunk.split("-").map(Number);
      const inChunk = episode.number >= start && episode.number <= end;
      
      return matchesText && inChunk;
    });
  }, [episodesMetadata, filterText, selectedChunk]);

  const cycleViewMode = () => {
    if (episodesListViewMode === "grid") {
      setEpisodesListViewMode("list");
    } else if (episodesListViewMode === "list") {
      setEpisodesListViewMode("image");
    } else {
      setEpisodesListViewMode("grid");
    }
  };

  return (
    <Card 
      className="h-fit max-h-[80vh] max-w-[450px] min-w-[450px]"
    >
      <CardHeader className="flex flex-col gap-3">
        <div className="flex flex-row gap-2 items-center w-full">
          <div className="flex flex-row gap-2 items-center w-full">
            {chunks && (
              <Select
                value={selectedChunk}
                onValueChange={setSelectedChunk}
              >
                <SelectTrigger className="w-28 h-9">
                  <SelectValue placeholder="Episodes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {chunks.map(chunk => (
                    <SelectItem key={chunk.value} value={chunk.value}>
                      {chunk.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter episodesMetadata..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="p-2"
              onClick={() => setEpisodesListSpoilerMode(!episodesListSpoilerMode)}
              title={episodesListSpoilerMode ? "Show spoilers" : "Hide spoilers"}
            >
              {episodesListSpoilerMode ? <EyeOff size={18} /> : <Eye size={18} />}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="p-2"
              onClick={cycleViewMode}
              title="Change view mode"
            >
              {episodesListViewMode === "grid" && <Grid size={18} />}
              {episodesListViewMode === "list" && <List size={18} />}
              {episodesListViewMode === "image" && <ImageIcon size={18} />}
            </Button>
          </div>
        </div>
        
      </CardHeader>
      <CardContent
        ref={scrollAreaRef}
        className="relative h-fit min-h-[10vh] w-full overflow-y-auto"
      >
        <div
          style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: 'relative',
          }}
        >
          {episodesListViewMode === "grid" && (
            <GridView 
              episodes={filteredEpisodes} 
              currentEpisode={currentEpisode} 
              animeId={params.id} 
              router={router} 
            />
          )}
          
          {episodesListViewMode === "list" && (
            <ListView 
              episodes={filteredEpisodes} 
              currentEpisode={currentEpisode} 
              animeId={params.id} 
              router={router} 
              spoilerMode={episodesListSpoilerMode}
              animeData={animeData}
            />
          )}
          
          {episodesListViewMode === "image" && (
            <ImageView 
              episodes={filteredEpisodes} 
              currentEpisode={currentEpisode} 
              animeId={params.id} 
              router={router} 
              spoilerMode={episodesListSpoilerMode}
              animeData={animeData}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}