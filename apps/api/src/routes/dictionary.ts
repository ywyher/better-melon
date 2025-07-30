import Elysia, { t } from "elysia";
import { searchDictionary } from "../services/dictionary";
import { createError } from "../utils/utils";
import { dictionarySearchResponse } from "../types/dictionary";
import { searchJMdict } from "../services/jmdict";
import { jmdictSearchResponse } from "../types/jmdict";
import { searchNHK } from "../services/nhk";

export const dictionary = new Elysia()
  .get('/dictionary/search/:query', 
    async ({ params: { query } }) => {
      try {
        const decodedQuery = decodeURIComponent(query)
        const  result = await searchDictionary(decodedQuery)
        return {
          success: true,
          data: result
        }
      } catch (error) {
        return createError(`${error instanceof Error ? error.message : 'Failed to fetch data from hianime provider: Unknown error'}`);
      }
  }, {
    params: t.Object({
      query: t.String()
    }),
    response: t.Object({
      success: t.Boolean(),
      data: t.Optional(dictionarySearchResponse),
      message: t.Optional(t.String())
    })
  })
  .get('/indexes/:index/search/:query', 
    async ({ params: { query } }) => {
      try {
        const decodedQuery = decodeURIComponent(query)
        const { entries } = await searchJMdict(decodedQuery)
        return {
          success: true,
          data: {
            entries
          },
        }
      } catch (error) {
        return createError(`${error instanceof Error ? error.message : 'Failed to fetch data from hianime provider: Unknown error'}`);
      }
  }, {
    params: t.Object({
      index: t.Literal("jmdict"),
      query: t.String()
    }),
    response: t.Object({
      success: t.Boolean(),
      data: t.Optional(jmdictSearchResponse),
      message: t.Optional(t.String())
    })
  })
  .get('/pitch/search/*',
    async ({ params }) => {
      try {
        const decodedQuery = decodeURIComponent(params['*'])
        const { entries } = await searchNHK(decodedQuery)

        return {
          success: true,
          data: {
            entries
          },
        }
      } catch (error) {
        return createError(`${error instanceof Error ? error.message : 'Failed to fetch data from hianime provider: Unknown error'}`);
      }
    }, {
      params: t.Object({
        "*": t.String()
      }),
      response: t.Object({
        success: t.Boolean(),
        data: t.Optional(t.Any()),
        message: t.Optional(t.String())
      })
    }
  )