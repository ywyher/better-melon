'use server'

import { env } from "@/lib/env/server";
import { AnimeEpisodeData, AnimeProvider } from "@/types/anime";

export async function getEpisodeData(animeId: string, episodeNumber: number, provider: AnimeProvider): Promise<AnimeEpisodeData> {
  try {
    const dataRaw = await fetch(
      `${env.API_URL}/${animeId}/${episodeNumber}/${provider}`
    );
    
    if (!dataRaw.ok) {
      throw new Error(`API responded with status: ${dataRaw.status}`);
    }
    const { data, message, success } = await dataRaw.json() as {
      success: boolean,
      data: Omit<AnimeEpisodeData, 'metadata'>,
      message: string,
    };

    if (!success) {
      throw new Error(message || 'API returned failure');
    }

    // Verify the data structure before returning
    if (!data || !data.details) {
      throw new Error('Invalid data structure returned from API');
    }

    return {
      ...data,
      metadata: {
        number: episodeNumber,
        title: data.details.title.english,
        image: data.details.coverImage.large,
        description: data.details.description,
        thumbnails: data.sources.tracks.find(t => t.lang == 'thumbnails')
      }
    };
  } catch (error) {
    throw new Error(`Failed to fetch initial anime data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}