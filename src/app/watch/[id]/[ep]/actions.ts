'use server'

import { getGeneralSettings } from "@/app/settings/general/actions";
import { getPlayerSettings } from "@/app/settings/player/actions";
import { getSubtitleSettings } from "@/app/settings/subtitle/_subtitle-settings/actions";
import type { AnimeEpisodeMetadata, AnimeStreamingData } from "@/types/anime";
import type { SubtitleEntry, SubtitleFile } from "@/types/subtitle";

export async function getEpisodeContext(animeId: string, episodeNumber: number) {
  try {
    const [episodesMetadata, subtitleEntries, subtitleSettings, generalSettings, playerSettings] = await Promise.all([
      getEpisodesMetadata(animeId),
      getSubtitleEntries(animeId),
      getSubtitleSettings(),
      getGeneralSettings(),
      getPlayerSettings(),
    ]);
    const episode = episodesMetadata.find(
      (episode: AnimeEpisodeMetadata) => episode.number === episodeNumber
    );
    if(!episode) throw new Error("Failed to fetch initial anime data");
    
    const [episodeStreamingData, subtitleFiles] = await Promise.all([
      // getStreamingData('erased-151$episode$4040'),
      getStreamingData(episode.id),
      getSubtitleFiles(subtitleEntries[0].id, episodeNumber)
    ]);

    return {
      episodesMetadata,
      episodeStreamingData,
      subtitleFiles,
      subtitleSettings,
      generalSettings,
      playerSettings,
    };
  } catch (error) {
    console.error('Error fetching initial anime data:', error);
    throw new Error(`Failed to fetch initial anime data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getEpisodesMetadata(animeId: string): Promise<AnimeEpisodeMetadata[]> {
  try {
    const res = await fetch(`${process.env.CONSUMET_URL}/meta/anilist/episodes/${animeId}?provider=zoro`);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch episodes data: ${res.status} ${res.statusText}`);
    }
    
    return await res.json() as AnimeEpisodeMetadata[];
  } catch (error) {
    console.error('Error fetching episodes data:', error);
    throw new Error(`Failed to fetch episodes data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getStreamingData(episodeId: string): Promise<AnimeStreamingData> {
  try {
    const res = await fetch(`${process.env.CONSUMET_URL}/meta/anilist/watch/${episodeId}?provider=zoro`);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch streaming data: ${res.status} ${res.statusText}`);
    }
    
    return await res.json() as AnimeStreamingData;
  } catch (error) {
    console.error('Error fetching streaming data:', error);
    throw new Error(`Failed to fetch streaming data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getSubtitleEntries(animeId: string): Promise<SubtitleEntry[]> {
  try {
    const res = await fetch(`https://jimaku.cc/api/entries/search?anilist_id=${animeId}`, {
      headers: { Authorization: `${process.env.JIMAKU_KEY}` },
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch subtitle entries: ${res.status} ${res.statusText}`);
    }
    
    return await res.json() as SubtitleEntry[];
  } catch (error) {
    console.error('Error fetching subtitle entries:', error);
    throw new Error(`Failed to fetch subtitle entries: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getSubtitleFiles(entryId: number, ep: number): Promise<SubtitleFile[]> {
  try {
    const res = await fetch(`https://jimaku.cc/api/entries/${entryId}/files?episode=${ep}`, {
      headers: { Authorization: `${process.env.JIMAKU_KEY}` },
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch subtitle files: ${res.status} ${res.statusText}`);
    }
    
    return await res.json() as SubtitleFile[];
  } catch (error) {
    console.error('Error fetching subtitle files:', error);
    throw new Error(`Failed to fetch subtitle files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}