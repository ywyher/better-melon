'use server'

import { getSubtitleSettings } from "@/app/settings/subtitle/_subtitle-settings/actions";
import { SubtitleSettings } from "@/lib/db/schema";
import { AnimeEpisodeData, AnimeStreamingData } from "@/types/anime";
import { SubtitleEntry, SubtitleFile } from "@/types/subtitle";

export async function getCompleteData(animeId: string, episodeNumber: number) {
  try {
    const subtitleSettings = await getSubtitleSettings() as SubtitleSettings
    
    const episodesData = await getEpisodesData(animeId);
    const episode = episodesData.find(
      (episode: AnimeEpisodeData) => episode.number === episodeNumber
    );
    if(!episode) throw new Error(`Failed to fetch initial anime data`);
    
    const entryId = 2184;
    const [episodeData, subtitleFiles] = await Promise.all([
      // getStreamingData('erased-151$episode$4040'),
      getStreamingData(episode.id),
      getSubtitleFiles(entryId, episodeNumber)
    ]);

    return {
      episodesData,
      episodeData,
      subtitleFiles,
      subtitleSettings
    };
  } catch (error) {
    console.error('Error fetching initial anime data:', error);
    throw new Error(`Failed to fetch initial anime data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getEpisodesData(animeId: string): Promise<AnimeEpisodeData[]> {
  try {
    const res = await fetch(`${process.env.CONSUMET_URL}/meta/anilist/episodes/${animeId}?provider=zoro`);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch episodes data: ${res.status} ${res.statusText}`);
    }
    
    return await res.json() as AnimeEpisodeData[];
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

export async function getSubtitleEntries(id: string): Promise<SubtitleEntry[]> {
  try {
    const res = await fetch(`https://jimaku.cc/api/entries/search?anilist_id=${id}`, {
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