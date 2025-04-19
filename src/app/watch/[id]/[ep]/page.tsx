'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Player from "@/app/watch/[id]/[ep]/_components/player/player";
import { AnimeEpisodeData, AnimeStreamingData } from "@/types/anime";
import { useParams } from 'next/navigation';
import { usePlayerStore } from '@/lib/stores/player-store';
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
import { getEpisodesData, getStreamingData, getSubtitleEntries, getSubtitleFiles } from '@/app/watch/[id]/[ep]/actions';
import { getSubtitleSettings } from '@/app/settings/subtitle/_subtitle-settings/actions';

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

  const { 
    data: episodesData, 
    isLoading: isLoadingEpisodes, 
    error: episodesError 
  } = useQuery({
    queryKey: ['episodesData', id],
    queryFn: async () => await getEpisodesData(id),
    refetchOnWindowFocus: false
  });

  const episode = episodesData?.find(
    (episode: AnimeEpisodeData) => episode.number === episodeNumber
  );

  const { 
    data: streamingData, 
    isLoading: isLoadingStreamingData,
    error: streamingError
  } = useQuery({
    queryKey: ['streamingData', episode?.id],
    queryFn: async () => await getStreamingData(episode?.id || ""),
    refetchOnWindowFocus: false,
    enabled: !!episode
  });

  const {
    data: subtitleEntries,
    isLoading: isLoadingSubtitleEntries,
    error: subtitleEntriesError
  } = useQuery({
    queryKey: ['subtitleEntries', id],
    queryFn: async () => await getSubtitleEntries(id),
    refetchOnWindowFocus: false
  });

  const {
    data: subtitleFiles,
    isLoading: isLoadingSubtitleFiles,
    error: subtitleFilesError
  } = useQuery({
    queryKey: ['subtitleFiles', subtitleEntries?.[0]?.id, ep],
    queryFn: async () => {
      if(!subtitleEntries || !subtitleEntries[0].id || !episode) return;
      return await getSubtitleFiles(subtitleEntries[0].id, episode?.number)
    },
    refetchOnWindowFocus: false,
    enabled: !!subtitleEntries && subtitleEntries.length > 0,
  });
  
  const {
    data: subtitleSettings,
    isLoading: isLoadingSubtitleSettings,
    error: subtitleSettingsError
  } = useQuery({
    queryKey: ['settings', 'subtitle-settings'],
    queryFn: async () => {
      return await getSubtitleSettings() || null
    },
    refetchOnWindowFocus: false,
  })

  const { setEnglishSubtitleUrl, setActiveSubtitleFile } = usePlayerStore();

  useEffect(() => {
    if(!streamingData || !subtitleFiles?.length) return;
    
    setActiveSubtitleFile(null);
    setEnglishSubtitleUrl(null);
    
    if (subtitleFiles.length > 0) {
      const selected = selectSubtitleFile({ 
        files: subtitleFiles,
        preferredFormat: subtitleSettings?.preferredFormat,
        matchPattern: subtitleSettings?.matchPattern,
      });
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
  }, [episode?.id, streamingData, subtitleFiles, setActiveSubtitleFile, setEnglishSubtitleUrl]);

  const errors = [episodesError, streamingError, subtitleEntriesError, subtitleFilesError, animeError, subtitleSettingsError];
  const errorMessages = errors.filter(error => error !== null && error !== undefined);
  
  if(errorMessages.length > 0) {
    return <Indicator type='error' message={errorMessages[0]?.message || "An error occurred"} />;
  }

  const isPlayerLoading = isLoadingEpisodes || isLoadingStreamingData || !episode || !streamingData || isLoadingSubtitleSettings;
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
        <div>
        {renderPlayerContent()}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-row gap-10">
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
    </>
  );
}