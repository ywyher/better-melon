import Elysia, { t } from "elysia";
import { getHianimeAnime } from "../services/hianime";
import { getSubtitleFiles } from "../services/subtitle";
import { createError } from "../utils/utils";
import { animeProvider } from "../types";
import { subtitleFile } from "../types/jiamku";
import { getKitsuAnimeEpisodes, getKitsuAnimeInfo } from "../services/kitsu";
import { getAnilistAnime } from "../services/anilist";
import { anilistAnime } from "../types/anilist";
import { hianimeEpisodeSources, kitsuEpisodesReponse } from "@better-melon/shared/types";

export const anime = new Elysia({ prefix: 'anime' })
  .get('/:anilistId/:episodeNumber/:provider',
    async ({ params: { anilistId, episodeNumber, provider } }) => {
      const fetchStart = performance.now()
      console.clear()
      console.log('*-----------------------------------------------------------------------------------*')
      try {
        const anime = await getHianimeAnime(anilistId, episodeNumber);
        const SubtitleFiles = await getSubtitleFiles(anime.details, episodeNumber);

        const fetchEnd = performance.now()
        console.log(`Fetched data in ${(fetchEnd - fetchStart).toFixed(2)}ms`);
  
        return {
          success: true,
          data: {
            provider,
            details: anime.details,
            sources: anime.sources,
            subtitles: SubtitleFiles,
          }
        };
      } catch (error) {
        return createError(`${error instanceof Error ? error.message : 'Failed to fetch data from hianime provider: Unknown error'}`);
      }
    },
    {
      params: t.Object({
        anilistId: t.Number(),
        episodeNumber: t.String(),
        provider: animeProvider,
      }),
      response: t.Object({
        success: t.Boolean(),
        data: t.Optional(t.Object({
          provider: animeProvider,
          details: anilistAnime,
          sources: hianimeEpisodeSources,
          subtitles: t.Array(subtitleFile)
        })),
        message: t.Optional(t.String())
      })
  })
  .get('/:anilistId/episodes',
    async ({ params: { anilistId }, query: { limit, offset } }) => {
      const fetchStart = performance.now()

      try {
        const anilistData = await getAnilistAnime(anilistId)
        const anime = await getKitsuAnimeInfo(anilistData);
        const { count, episodes } = await getKitsuAnimeEpisodes({
          kitsuAnimeId: anime.id,
          anilistData,
          limit,
          offset
        })
   
        const fetchEnd = performance.now()
        console.log(`Fetched data in ${(fetchEnd - fetchStart).toFixed(2)}ms`);
  
        return {
          success: true,
          data: {
            episodes,
            count
          }
        };
      } catch (error) {
        return createError(`${error instanceof Error ? error.message : 'Failed to fetch data from hianime provider: Unknown error'}`);
      }
    },
    {
      params: t.Object({
        anilistId: t.Number(),
      }),
      response: t.Object({
        success: t.Boolean(),
        data: t.Optional(kitsuEpisodesReponse),
        message: t.Optional(t.String())
      }),
      query: t.Object({
        limit: t.Optional(t.Number()),
        offset: t.Optional(t.Number())
      })
  })