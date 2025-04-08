'use server'

import { AnimeEpisodeData, AnimeStreamingData } from "@/types/anime";
import { SubtitleEntry, SubtitleFile } from "@/types/subtitle";

// Server action to fetch episodes data
export async function getEpisodesData(id: string): Promise<AnimeEpisodeData[]> {
    try {
      const res = await fetch(`${process.env.CONSUMET_URL}/meta/anilist/episodes/${id}?provider=zoro`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch episodes data: ${res.status} ${res.statusText}`);
      }
      
      return await res.json() as AnimeEpisodeData[];
    } catch (error) {
      console.error('Error fetching episodes data:', error);
      throw new Error(`Failed to fetch episodes data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// Server action to fetch streaming data
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

  // Server action to fetch subtitle entries
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

// Server action to fetch subtitle files
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