'use client';

import { useEffect, useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { usePlayerStore } from '@/lib/stores/player-store';
import { filterSubtitleFiles, selectSubtitleFile } from '@/lib/subtitle';
import { playerQueries } from '@/lib/queries/player';
import SettingsDialog from '@/app/watch/[id]/[ep]/_components/settings/settings-dialog';
import { Button } from '@/components/ui/button';
import { Captions, Loader2 } from 'lucide-react';
import { useIsMedium } from '@/hooks/use-media-query';
import DialogWrapper from '@/components/dialog-wrapper';
import EpisodesListSkeleton from '@/app/watch/[id]/[ep]/_components/episodes/episodes-list-skeleton';
import EpisodesList from '@/app/watch/[id]/[ep]/_components/episodes/episodes-list';

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
  const episodeNumber = Number(ep);

  const isMedium = useIsMedium()
  const queryClient = useQueryClient()

  const [isVideoReady, setIsVideoReady] = useState<boolean>(false)
  
  const {
    loading: isLoadingAnime, 
    error: animeError, 
    data: animeData 
  } = useGqlQuery(GET_ANIME_DATA, { 
    variables: { id: Number(animeId) },
    fetchPolicy: 'cache-first',
  });
  
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
  const currentEpisode = data?.episodesData?.find((e) => e.number === episodeNumber);
  const isLoading = isLoadingData || !data || !currentEpisode;
  const subtitleFiles = data?.subtitleFiles ? filterSubtitleFiles(data.subtitleFiles) : [];
  const episodesLength = data?.episodesData?.length || 0;

  useEffect(() => {
    if (isLoadingData) {
      loadingStartTime.current = Date.now();
    } else if (data && loadingStartTime.current > 0 && loadingDuration === 0) {
      const duration = Date.now() - loadingStartTime.current;
      setLoadingDuration(duration);
    }
  }, [isLoadingData, data, loadingDuration]);

  const { setEnglishSubtitleUrl, setActiveSubtitleFile } = usePlayerStore();
  
  useEffect(() => {
    console.log(data)
    if (!data || !data.episodeData) return;
    
    setActiveSubtitleFile(null);
    setEnglishSubtitleUrl(null);
    
    if (data.subtitleFiles?.length > 0) {
      const selected = selectSubtitleFile({ 
        files: data.subtitleFiles,
        preferredFormat: data.subtitleSettings?.preferredFormat || null,
        matchPattern: data.subtitleSettings?.matchPattern || null,
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

  useEffect(() => {
    if (data?.episodesData && episodeNumber < episodesLength) {
      const nextEpisodeNumber = episodeNumber + 1;
      
      (async () => {
        try {
          await queryClient.prefetchQuery({
            ...playerQueries.episodeData(animeId, nextEpisodeNumber),
            staleTime: 1000 * 60 * 5,
          });
          console.log(`Prefetched episode ${nextEpisodeNumber} successfully`);
        } catch (error) {
          console.error(`Failed to prefetch episode ${nextEpisodeNumber}:`, error);
        }
      })();
    }
  }, [data, animeId, episodeNumber, episodesLength, queryClient]);
  
  const errors = [animeError, dataError].filter(Boolean);
  if (errors.length > 0) {
    return <Indicator type='error' message={errors[0]?.message || "An error occurred"} />;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row w-full md:gap-10">
        <div className="flex flex-col gap-3 w-full">
          <div className="flex items-center justify-between w-full">
            <GoBack />
            <div className="flex flex-row gap-3 items-center">
              {loadingDuration > 0 && (
                <div className="text-sm text-gray-400">
                  Loaded in {(loadingDuration / 1000).toFixed(2)}s
                </div>
              )}
              {isLoading ? (
                <div className="flex flex-row gap-2">
                  <Button variant='outline'>
                    <Loader2 className='animate-spin' />
                  </Button>
                  {isMedium && (
                    <Button variant='outline'>
                      <Loader2 className='animate-spin' />
                    </Button>
                  )}
                </div>
              ): (
                <div className='flex flex-row gap-2'>
                  <SettingsDialog 
                    generalSettings={data.generalSettings}
                  />
                  {isMedium && (
                    <DialogWrapper
                      trigger={<Button variant='outline'>
                        <Captions />
                      </Button>}
                      className="overflow-y-auto w-full flex flex-col"
                      breakpoint='medium'
                    >
                      <SubtitlePanel
                        subtitleFiles={subtitleFiles}
                        japaneseTranscription={data.japaneseTranscription}
                      />
                    </DialogWrapper>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col gap-3 w-full">
              <div className="relative w-full lg:aspect-video bg-gray-900">
                <PlayerSkeleton isLoading={isLoadingData} />
              </div>
              <div className="w-full">
                <SettingsSkeleton />
              </div>
            </div>
          ): (
            <Player 
              animeId={animeId}
              episodeNumber={episodeNumber}
              isVideoReady={isVideoReady}
              setIsVideoReady={setIsVideoReady}
              episode={currentEpisode} 
              streamingData={data?.episodeData} 
              episodesLength={episodesLength}
            />
          )}

          {isLoading ? (
            <div className="flex flex-col gap-3 w-full">
              <div className="w-full">
                <SettingsSkeleton />
              </div>
            </div>
          ) : (
            <div className='flex flex-col gap-3 w-full'>
              <Settings 
                playerSettings={data.playerSettings}
                generalSettings={data.generalSettings} 
                episodesLength={episodesLength} 
              />
            </div>
          )}
        </div>
        
        {!isMedium && (
          <div className={`flex flex-col gap-5 w-full md:w-auto ${isMedium ? 'hidden' : 'block'}`}>
              {(isLoading) ? (
                <PanelSkeleton />
              ) : (
                <>
                  <SubtitlePanel
                    subtitleFiles={subtitleFiles}
                    japaneseTranscription={data.japaneseTranscription}
                  />
                </>
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
        )}
      </div>
    </>
  );
}