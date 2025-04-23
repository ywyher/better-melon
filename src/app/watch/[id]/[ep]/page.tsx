'use client';

import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { gql, useQuery as useGqlQuery } from "@apollo/client";
import { useParams } from 'next/navigation';

import Player from "@/app/watch/[id]/[ep]/_components/player/player";
import GoBack from '@/components/goback';
import Settings from '@/app/watch/[id]/[ep]/_components/settings/settings';
import SubtitlePanel from '@/app/watch/[id]/[ep]/_components/panel/panel';
import PlayerSkeleton from '@/app/watch/[id]/[ep]/_components/player/player-skeleton';
import PanelSkeleton from '@/app/watch/[id]/[ep]/_components/panel/panel-skeleton';
import SettingsSkeleton from '@/app/watch/[id]/[ep]/_components/settings/settings-skeleton';
import { Indicator } from '@/components/indicator';
import EpisodesList from '@/app/watch/[id]/[ep]/_components/episodes/episodes-list';
import EpisodesListSkeleton from '@/app/watch/[id]/[ep]/_components/episodes/episodes-list-skeleton';

import { usePlayerStore } from '@/lib/stores/player-store';
import { filterSubtitleFiles, selectSubtitleFile } from '@/lib/subtitle';
import { playerQueries } from '@/lib/queries/player';
import { AnimeEpisodeData, AnimeStreamingData } from "@/types/anime";
import { SubtitleFile } from '@/types/subtitle';
import { SubtitleSettings } from '@/lib/db/schema';

// GraphQL query moved outside component
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
`;

export default function Watch() {
  const params = useParams();
  const animeId = params.id as string;
  const ep = params.ep as string;
  const episodeNumber = parseInt(ep);
  
  // Fetch anime metadata
  const { 
    loading: isLoadingAnime, 
    error: animeError, 
    data: animeData 
  } = useGqlQuery(GET_ANIME_DATA, { 
    variables: { id: parseInt(animeId) },
    fetchPolicy: 'cache-first',
  });
  
  // Fetch episode data
  const {
    data,
    isLoading: isLoadingData,
    error: dataError,
  } = useQuery({
    ...playerQueries.episodeData(animeId, episodeNumber),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const loadingStartTime = useRef<number>(0);
  const [loadingDuration, setLoadingDuration] = useState<number>(0);
  
  useEffect(() => {
    if (isLoadingData) {
      loadingStartTime.current = Date.now();
    } else if (data && loadingStartTime.current > 0 && loadingDuration === 0) {
      const duration = Date.now() - loadingStartTime.current;
      setLoadingDuration(duration);
    }
  }, [isLoadingData, data]);
  
  const { setEnglishSubtitleUrl, setActiveSubtitleFile } = usePlayerStore();
  
  useEffect(() => {
    if (!data || !data.episodeData) return;
    
    setActiveSubtitleFile(null);
    setEnglishSubtitleUrl(null);
    
    if (data.subtitleFiles?.length > 0) {
      const selected = selectSubtitleFile({ 
        files: data.subtitleFiles,
        preferredFormat: data.subtitleSettings.preferredFormat,
        matchPattern: data.subtitleSettings.matchPattern,
      });
      
      if (selected) {
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
    
    if (data.episodeData.subtitles) {
      const englishSub = data.episodeData.subtitles.find(
        (s) => s.lang === 'English'
      )?.url || "";
      setEnglishSubtitleUrl(englishSub);
    }
  }, [data, setActiveSubtitleFile, setEnglishSubtitleUrl]);

  const errors = [animeError, dataError].filter(Boolean);
  if (errors.length > 0) {
    return <Indicator type='error' message={errors[0]?.message || "An error occurred"} />;
  }

  const currentEpisode = data?.episodesData?.find((e) => e.number == episodeNumber);
  const isLoading = isLoadingData || !data || !currentEpisode;
  const subtitleFiles = data?.subtitleFiles ? filterSubtitleFiles(data.subtitleFiles) : [];
  const episodesLength = data?.episodesData?.length || 0;

  return (
    <>
      <div className="flex flex-row gap-10">
        <div className="flex flex-col gap-3 flex-1">
          <div className="flex items-center justify-between">
            <GoBack />
            {loadingDuration > 0 && (
              <div className="text-sm text-gray-400">
                Loaded in {(loadingDuration / 1000).toFixed(2)}s
              </div>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex flex-col gap-3">
              <div className="relative w-full aspect-video bg-gray-900">
                <PlayerSkeleton isLoading={isLoadingData} />
              </div>
              <div className="w-full">
                <SettingsSkeleton />
              </div>
            </div>
          ) : (
            <div className='flex flex-col gap-3'>
              <Player 
                episode={currentEpisode as AnimeEpisodeData} 
                streamingData={data.episodeData} 
                subtitleFiles={subtitleFiles} 
                episodesLength={episodesLength}
              />
              <Settings episodesLength={episodesLength} />
            </div>
          )}
        </div>
        
        <div className='flex flex-col gap-5'>
          {isLoading ? (
            <PanelSkeleton />
          ) : (
            <SubtitlePanel subtitleFiles={subtitleFiles} />
          )}
          
          {(isLoadingAnime || !data?.episodesData) ? (
            <EpisodesListSkeleton />
          ) : (
            <EpisodesList 
              animeData={animeData.Media} 
              episodes={data.episodesData} 
            />
          )}
        </div>
      </div>
    </>
  );
}