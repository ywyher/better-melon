'use server'

import { getGeneralSettings } from "@/app/settings/general/actions";
import { getPlayerSettings } from "@/app/settings/player/actions";
import { getSubtitleSettings } from "@/app/settings/subtitle/_subtitle-settings/actions";
import { AnimeEpisodeContext, AnimeEpisodeData, AnimeProvider } from "@/types/anime";

export async function getEpisodeData(animeId: string, episodeNumber: number, provider: AnimeProvider): Promise<AnimeEpisodeData> {
  try {
    const dataRaw = await fetch(
      `${process.env.MAPPER_URL}/${animeId}/${episodeNumber}/${provider}`
    );
    
    if (!dataRaw.ok) {
      throw new Error(`API responded with status: ${dataRaw.status}`);
    }
    const data = await dataRaw.json();

    if (!data.success) {
      throw new Error(data.message || 'API returned failure');
    }

    // Verify the data structure before returning
    if (!data.data || !data.data.details) {
      throw new Error('Invalid data structure returned from API');
    }

    return data.data;
  } catch (error) {
    throw new Error(`Failed to fetch initial anime data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getEpisodeContext(animeId: string, episodeNumber: number): Promise<Omit<AnimeEpisodeContext, 'japaneseTranscription'>> {
  try {
    const [data, subtitleSettings, generalSettings, playerSettings] = await Promise.all([
      getEpisodeData(animeId, episodeNumber, 'hianime'),
      getSubtitleSettings(),
      getGeneralSettings(),
      getPlayerSettings(),
    ]);

    return {
      data,
      metadata: {
        number: 1,
        title: 'HI',
        image: "https://media.kitsu.app/episodes/thumbnails/229115/original.jpeg",
      },
      subtitleSettings,
      generalSettings,
      playerSettings,
    };
  } catch (error) {
    throw new Error(`Failed to fetch initial anime data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}