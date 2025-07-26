import { meili } from "../lib/meilisearch";
import { JMdictSearchResponse } from "../types/jmdict";
import { getJMdictSearchQueries } from "../utils/jmdict";
import { mergeResultsByIndex } from "../utils/dictionary";
import { Index } from "../types/meilisearch";

export async function searchJMdict(query: string): Promise<JMdictSearchResponse> {
  const jmdictQueries = getJMdictSearchQueries(query)
  try {
    const { results } = await meili.multiSearch({ 
      queries: [
        ...jmdictQueries,
      ]
    });

    const mergedResults = mergeResultsByIndex(results);

    return {
      entries: mergedResults[0].hits as any
    } as JMdictSearchResponse;
  } catch (error) {
    console.error('Error in searchJMdict:', error);
    throw new Error(`${error instanceof Error ? error.message : 'Failed to search jmdict: Unknown error'}`);
  }
}