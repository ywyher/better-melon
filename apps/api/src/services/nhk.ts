import { meili } from "../lib/meilisearch";
import { mergeResultsByIndex } from "../utils/dictionary";

export async function searchNHK(query: string): Promise<any> {
  try {
    const searchQueries = query.split(',').map((q) => {
      return {
        indexUid: 'nhk',
        q: `"${q}"`,
        limit: 1,
        filter: [
          `word = "${q}"`
        ]
      }
    })

    const { results } = await meili.multiSearch({
      queries: searchQueries
    })
    const entries = mergeResultsByIndex(results)

    return {
      entries: entries[0].hits
    };
  } catch (error) {
    console.error('Error in mutlisearchNHK:', error);
    throw new Error(`${error instanceof Error ? error.message : 'Failed to search nhk: Unknown error'}`);
  }
}