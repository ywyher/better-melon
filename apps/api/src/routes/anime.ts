import Elysia, { t } from "elysia";
import { getHianimeAnime } from "../services/hianime";
import { getSubtitleFiles } from "../services/subtitle";
import { createError } from "../utils/utils";
import { getAnilistAnime } from "../services/anilist";
import { animeProvider, kitsuEpisodesReponse, streamingData } from "@better-melon/shared/types";
import { getKitsuAnime, getKitsuEpisodes, getKitsuInfo } from "../services/kitsu";

export const anime = new Elysia({ prefix: 'anime' })
  .get('/:anilistId/:episodeNumber/:provider',
    async ({ params: { anilistId, episodeNumber, provider } }) => {
      const fetchStart = performance.now()
      console.clear()
      console.log('*-----------------------------------------------------------------------------------*')
      try {
        const anilistData = await getAnilistAnime({ anilistId })
        
        const [{ sources }, { episode }, subtitles] = await Promise.all([
          getHianimeAnime({ anilistData, episodeNumber }),
          getKitsuAnime({ anilistData, episodeNumber }),
          getSubtitleFiles({  anilistData, episodeNumber })
        ])
        const fetchEnd = performance.now()
        console.log(`Fetched data in ${(fetchEnd - fetchStart).toFixed(2)}ms`);
  
        return {
          success: true,
          data: {
            provider,
            anime: anilistData,
            episode: {
              details: episode,
              sources,
              subtitles,
            }
          }
        };
      } catch (error) {
        return createError(`${error instanceof Error ? error.message : 'Failed to fetch data from hianime provider: Unknown error'}`);
      }
    },
    {
      params: t.Object({
        anilistId: t.Number(),
        episodeNumber: t.Number(),
        provider: animeProvider,
      }),
      response: t.Object({
        success: t.Boolean(),
        data: t.Optional(streamingData),
        message: t.Optional(t.String())
      })
  })
  .get('/:anilistId/episodes',
    async ({ params: { anilistId }, query: { limit, offset } }) => {
      const fetchStart = performance.now()

      try {
        const anilistData = await getAnilistAnime({ anilistId })
        const anime = await getKitsuInfo({ anilistData });
        const { count, episodes } = await getKitsuEpisodes({
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