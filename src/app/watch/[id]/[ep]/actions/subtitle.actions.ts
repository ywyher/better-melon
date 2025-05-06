'use server'

import { env } from "@/lib/env/server";
import { SubtitleEntry, SubtitleFile } from "@/types/subtitle";

export async function getSubtitleEntries(animeId: string): Promise<SubtitleEntry[]> {
  try {
    const res = await fetch(`https://jimaku.cc/api/entries/search?anilist_id=${animeId}`, {
      headers: { Authorization: `${env.JIMAKU_KEY}` },
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
      headers: { Authorization: `${env.JIMAKU_KEY}` },
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