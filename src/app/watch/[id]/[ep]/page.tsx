'use client';

import { useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import Player from "@/app/watch/[id]/[ep]/_components/player/player";
import { SubtitleFile } from "@/types/subtitle";
import { AnimeEpisodeData, AnimeStreamingData } from "@/types/anime";
import { useParams } from 'next/navigation';
import { useWatchStore } from '@/app/watch/[id]/[ep]/store';
import { filterSubtitleFiles, selectSubtitleFile } from '@/app/watch/[id]/[ep]/funcs';
import GoBack from '@/app/watch/[id]/[ep]/_components/goback';
import Settings from '@/app/watch/[id]/[ep]/_components/settings/settings';
import SubtitlePanel from '@/app/watch/[id]/[ep]/_components/panel/panel';
import PlayerSkeleton from '@/app/watch/[id]/[ep]/_components/player/player-skeleton';
import PanelSkeleton from '@/app/watch/[id]/[ep]/_components/panel/panel-skeleton';
import SettingsSkeleton from '@/app/watch/[id]/[ep]/_components/settings/settings-skeleton';
import { Indicator } from '@/components/indicator';
import EpisodesList from '@/app/watch/[id]/[ep]/_components/episodes/episodes-list';
import { gql, useQuery as useGqlQuery } from "@apollo/client"
import EpisodesListSkeleton from '@/app/watch/[id]/[ep]/_components/episodes/episodes-list-skeleton';

const GET_ANIME_DATA = gql`
  query($id: Int!) {
    Media(id: $id) {
      id
      idMal
      bannerImage
      format
      title {
        romaji
        english
      }  
      episodes
      coverImage {
        large
        medium
      }
      description
      genres
      status
      season
      seasonYear
    } 
  }
`

export default function Watch() {
  const params = useParams();
  const id = params.id as string;
  const ep = params.ep as string;
  const episodeNumber = parseInt(ep);

  const { loading: isLoadingAnime, error: animeError, data: animeData } = useGqlQuery(GET_ANIME_DATA, { variables: { id: parseInt(id) } })

  const fetchEpisodesData = useCallback(async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_CONSUMET_URL}/meta/anilist/episodes/${id}?provider=zoro`);
    if (!res.ok) throw new Error("Failed to fetch episodes data");
    return res.json() as Promise<AnimeEpisodeData[]>;
  }, [id]);

  const { 
    data: episodesData, 
    isLoading: isLoadingEpisodes, 
    error: episodesError 
  } = useQuery({
    queryKey: ['episodesData', id],
    queryFn: fetchEpisodesData
  });

  const episode = episodesData?.find(
    (episode: AnimeEpisodeData) => episode.number === episodeNumber
  );

  const fetchStreamingData = useCallback(async () => {
    if (!episode) return null;
    const res = await fetch(`${process.env.NEXT_PUBLIC_CONSUMET_URL}/meta/anilist/watch/${episode.id}?provider=zoro`);
    if (!res.ok) throw new Error("Failed to fetch streaming data");
    return res.json();
  }, [episode]);

  const { 
    data: streamingData, 
    isLoading: isLoadingStreamingData,
    error: streamingError
  } = useQuery({
    queryKey: ['streamingData', episode?.id],
    queryFn: fetchStreamingData,
    enabled: !!episode 
  });

  const fetchSubtitleEntries = useCallback(async () => {
    const res = await fetch(`https://jimaku.cc/api/entries/search?anilist_id=${id}`, {
      headers: { Authorization: `${process.env.NEXT_PUBLIC_JIMAKU_KEY}` },
    });
    if (!res.ok) throw new Error("Failed to fetch subtitle entries");
    return res.json();
  }, [id]);

  const {
    data: subtitleEntries,
    isLoading: isLoadingSubtitleEntries,
    error: subtitleEntriesError
  } = useQuery({
    queryKey: ['subtitleEntries', id],
    queryFn: fetchSubtitleEntries
  });

  const fetchSubtitleFiles = useCallback(async () => {
    if (!subtitleEntries || subtitleEntries.length === 0) return [];
    const res = await fetch(`https://jimaku.cc/api/entries/${subtitleEntries[0].id}/files?episode=${ep}`, {
      headers: { Authorization: `${process.env.NEXT_PUBLIC_JIMAKU_KEY}` },
    });
    if (!res.ok) throw new Error("Failed to fetch subtitle files");
    return res.json() as Promise<SubtitleFile[]>;
  }, [subtitleEntries, ep]);

  const {
    data: subtitleFiles,
    isLoading: isLoadingSubtitleFiles,
    error: subtitleFilesError
  } = useQuery({
    queryKey: ['subtitleFiles', subtitleEntries?.[0]?.id, ep],
    queryFn: fetchSubtitleFiles,
    enabled: !!subtitleEntries && subtitleEntries.length > 0,
  });

  const { setEnglishSubtitleUrl, setActiveSubtitleFile } = useWatchStore();

  useEffect(() => {
    if(!streamingData || !subtitleFiles?.length) return;
    
    // Reset subtitle state when episode changes
    setActiveSubtitleFile(null);
    setEnglishSubtitleUrl(null);
    
    if (subtitleFiles.length > 0) {
      const selected = selectSubtitleFile(subtitleFiles);
      if(selected) {
        setActiveSubtitleFile({
          source: 'remote',
          file: {
            name: selected.name,
            url: selected.url,
            last_modified: selected.last_modified,
            size: selected.size
          }
        });
      }
    }
    
    if (streamingData) {
      const englishSub = streamingData?.subtitles.find((s: AnimeStreamingData['subtitles'][0]) => s.lang === 'English')?.url || "";
      setEnglishSubtitleUrl(englishSub);
    }
  // Only include values that should trigger the effect
  }, [episode?.id, streamingData, subtitleFiles, setActiveSubtitleFile, setEnglishSubtitleUrl]);

  // Fix error handling
  const errors = [episodesError, streamingError, subtitleEntriesError, subtitleFilesError, animeError];
  const errorMessages = errors.filter(error => error !== null && error !== undefined);
  
  if(errorMessages.length > 0) {
    return <Indicator type='error' message={errorMessages[0]?.message || "An error occurred"} />;
  }

  const isPlayerLoading = isLoadingEpisodes || isLoadingStreamingData || !episode || !streamingData;
  const isPanelLoading = isLoadingSubtitleEntries || isLoadingSubtitleFiles || !subtitleFiles;

  // Extract PlayerContent to a separate component for better readability
  const renderPlayerContent = () => {
    if (isPlayerLoading) {
      return (
        <div className="flex flex-col gap-3">
          <div className="relative w-full aspect-video bg-gray-900">
            <PlayerSkeleton isLoading={isPlayerLoading} />
          </div>
          <div className="w-full">
            <SettingsSkeleton />
          </div>
        </div>
      );
    }
    
    return (
      <div className='flex flex-col gap-3'>
        <Player 
          episode={episode} 
          streamingData={streamingData} 
          subtitleFiles={subtitleFiles ? filterSubtitleFiles(subtitleFiles) : []} 
          episodesLength={episodesData?.length || 0}
        />
        <Settings episodesLength={episodesData?.length || 0} />
      </div>
    );
  };

  // When subtitles are empty but everything else is loaded
  if ((!subtitleEntries || subtitleEntries.length === 0) && streamingData) {
    return (
      <div className="container mx-auto px-4 py-6">
        {renderPlayerContent()}
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-10 container mx-auto px-4 py-6">
      <div className="flex flex-col gap-3 flex-1">
        <GoBack />
        {renderPlayerContent()}
      </div>
      <div className='flex flex-col gap-5'>
        {isPanelLoading ? (
          <PanelSkeleton />
        ) : (
          <SubtitlePanel
            subtitleFiles={filterSubtitleFiles(subtitleFiles || [])}
          />
        )}
        {(isLoadingAnime || !episodesData) ? (
          <EpisodesListSkeleton />
        ): (
          <EpisodesList animeData={animeData.Media} episodes={episodesData} />
        )}
      </div>
    </div>
  );
}