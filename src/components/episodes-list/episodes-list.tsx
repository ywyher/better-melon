"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Grid, List, Image as ImageIcon, Eye, EyeOff, Search } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCallback, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Anime, AnimeNextAiringEpisode, AnimeTitle } from "@/types/anime";
import useEpisodesList from "@/lib/hooks/use-episodes-list";
import GridView from "@/components/episodes-list/modes/grid";
import ImageView from "@/components/episodes-list/modes/image";
import ListView from "@/components/episodes-list/modes/list";
import { cn } from "@/lib/utils/utils";
import EpisodesListSkeleton from "@/components/episodes-list/skeleton";
import { Separator } from "@/components/ui/separator";
import AiringIn from "@/components/airing-in";

type EpisodesListProps = {
  nextAiringEpisode: AnimeNextAiringEpisode | null
  animeTitle: AnimeTitle
  animeBanner: Anime['bannerImage']
  className?: string
}

export default function EpisodesList({ nextAiringEpisode, animeTitle, animeBanner, className = "" }: EpisodesListProps) {
  const params = useParams<{ id: string, ep: string }>();
  const router = useRouter();
  const animeId = params.id
  const currentEpisode = Number(params.ep)
  
  const {
    episodes,
    isLoading,
    
    chunks,
    
    filterText,
    setFilterText,
    
    selectedChunk,
    setSelectedChunk,
    
    cycleViewMode,
    
    episodesListSpoilerMode,
    setEpisodesListSpoilerMode,
    episodesListViewMode,
  } = useEpisodesList({ animeId })

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: episodes?.length || 0,
    getScrollElement: () => scrollAreaRef.current,
    estimateSize: useCallback(() => 60, []),
    overscan: 10,
    measureElement: useCallback((element: Element) => {
      return element.getBoundingClientRect().height || 60;
    }, [episodes])
  });

  if(isLoading || !episodes) return <EpisodesListSkeleton viewMode={episodesListViewMode} />

  return (
    <Card 
      className={cn(
        "max-h-[100vh] bg-secondary",
        className
      )}
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
                placeholder="Filter episodes..."
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
        className="relative h-full min-h-[10vh] w-full overflow-y-auto"
      >
        <div
          style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: 'relative',
          }}
        >
          {episodesListViewMode === "grid" && (
            <GridView 
              episodes={episodes} 
              currentEpisode={currentEpisode} 
              animeId={animeId} 
              router={router} 
            />
          )}
          
          {episodesListViewMode === "list" && (
            <ListView 
              animeId={animeId} 
              episodes={episodes} 
              currentEpisode={currentEpisode} 
              spoilerMode={episodesListSpoilerMode}
              animeTitle={animeTitle}
              router={router} 
            />
          )}
          
          {episodesListViewMode === "image" && (
            <ImageView
              episodes={episodes} 
              currentEpisode={currentEpisode} 
              animeId={animeId} 
              router={router} 
              spoilerMode={episodesListSpoilerMode}
              animeTitle={animeTitle}
              animeBanner={animeBanner}
            />
          )}
        </div>
      </CardContent>
      {nextAiringEpisode && (
        <div>
          <Separator />
          <div className="px-4 pt-5">
            <AiringIn nextAiringEpisode={nextAiringEpisode} />
          </div>
        </div>
      )}
    </Card>
  );
}