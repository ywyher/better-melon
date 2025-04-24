'use server'

import { getGeneralSettings } from "@/app/settings/general/actions";
import { getPlayerSettings } from "@/app/settings/player/actions";
import { getSubtitleSettings } from "@/app/settings/subtitle/_subtitle-settings/actions";
import { parseSubtitleToJson, selectSubtitleFile } from "@/lib/subtitle";
import { getExtension } from "@/lib/utils";
import type { AnimeEpisodeData, AnimeStreamingData } from "@/types/anime";
import type { ActiveSubtitleFile, SubtitleCue, SubtitleEntry, SubtitleFile, SubtitleFormat } from "@/types/subtitle";

export async function getCompleteData(animeId: string, episodeNumber: number) {
  try {
    const [episodesData, subtitleEntries, subtitleSettings, generalSettings, playerSettings] = await Promise.all([
      getEpisodesData(animeId),
      getSubtitleEntries(animeId),
      getSubtitleSettings(),
      getGeneralSettings(),
      getPlayerSettings(),
    ]);
    const episode = episodesData.find(
      (episode: AnimeEpisodeData) => episode.number === episodeNumber
    );
    if(!episode) throw new Error("Failed to fetch initial anime data");
    
    const [episodeData, subtitleFiles] = await Promise.all([
      // getStreamingData('erased-151$episode$4040'),
      getStreamingData(episode.id),
      getSubtitleFiles(subtitleEntries[0].id, episodeNumber)
    ]);

    return {
      episodesData,
      episodeData,
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