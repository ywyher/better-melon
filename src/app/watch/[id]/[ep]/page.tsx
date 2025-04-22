'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Player from "@/app/watch/[id]/[ep]/_components/player/player";
import { AnimeEpisodeData, AnimeStreamingData } from "@/types/anime";
import { useParams } from 'next/navigation';
import { usePlayerStore } from '@/lib/stores/player-store';
import GoBack from '@/components/goback';
import Settings from '@/app/watch/[id]/[ep]/_components/settings/settings';
import SubtitlePanel from '@/app/watch/[id]/[ep]/_components/panel/panel';
import PlayerSkeleton from '@/app/watch/[id]/[ep]/_components/player/player-skeleton';
import PanelSkeleton from '@/app/watch/[id]/[ep]/_components/panel/panel-skeleton';
import SettingsSkeleton from '@/app/watch/[id]/[ep]/_components/settings/settings-skeleton';
import { Indicator } from '@/components/indicator';
import EpisodesList from '@/app/watch/[id]/[ep]/_components/episodes/episodes-list';
import { gql, useQuery as useGqlQuery } from "@apollo/client"
import EpisodesListSkeleton from '@/app/watch/[id]/[ep]/_components/episodes/episodes-list-skeleton';
import { filterSubtitleFiles, selectSubtitleFile } from '@/lib/subtitle';
import { playerQueries } from '@/lib/queries/player';
import { settingsQueries } from '@/lib/queries/settings';

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
  const animeId = params.id as string;
  const ep = params.ep as string;
  const episodeNumber = parseInt(ep);

  const { loading: isLoadingAnime, error: animeError, data: animeData } = useGqlQuery(GET_ANIME_DATA, { variables: { id: parseInt(animeId) } })

  const { 
    data: episodesData, 
    isLoading: isLoadingEpisodes, 
    error: episodesError 
  } = useQuery({
    ...playerQueries.episodeData(animeId),
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
    ...playerQueries.streamingData(episode?.id || ""),
    refetchOnWindowFocus: false,
    enabled: !!episode
  });

  const {
    data: subtitleEntries,
    isLoading: isLoadingSubtitleEntries,
    error: subtitleEntriesError
  } = useQuery({
    ...playerQueries.subtitleEntries(animeId),
    refetchOnWindowFocus: false
  });

  const {
    data: subtitleFiles,
    isLoading: isLoadingSubtitleFiles,
    error: subtitleFilesError
  } = useQuery({
    ...playerQueries.subtitleFiles(subtitleEntries?.[0]?.id || 1, episode?.number || 1),
    refetchOnWindowFocus: false,
    enabled: !!subtitleEntries && subtitleEntries.length > 0,
  });
  
  const {
    data: subtitleSettings,
    isLoading: isLoadingSubtitleSettings,
    error: subtitleSettingsError
  } = useQuery({
    ...settingsQueries.subtitle(),
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