import { isKana } from "wanakana";
import { Query } from "../types/dictionary";

export function getJMdictSearchQueries(query: string): Query[] {
  let jmdictQueries: Query[] = [];
  const kanaOnly = isKana(query)
  
  if (kanaOnly) {
    // Strategy: Multiple queries with different priorities
    jmdictQueries = [
      // 1. Kana-only entries (no kanji) - highest priority
      {
        indexUid: 'jmdict',
        q: `"${query}"`,
        limit: 3,
        filter: [
          `kana.text = "${query}"`,
          'kanji IS EMPTY'
        ],
        sort: ['kana.text:asc']
      },
      // 2. Entries with kanji that have this kana reading
      {
        indexUid: 'jmdict',
        q: `"${query}"`,
        limit: 3,
        filter: [`kana.text = ${query}`],
      },
      // 3. Fallback: Fuzzy Match
      {
        indexUid: 'jmdict',
        q: `${query}`,
        limit: 2,
        sort: [ 'isKana:desc' ]
      }
    ];
  } else {
    // Kanji/mixed queries
    jmdictQueries = [
      // Exact match
      {
        indexUid: 'jmdict',
        q: `"${query}"`,
        limit: 5,
        sort: ['kanji.text:asc']
      },
      // Fuzzy match
      {
        indexUid: 'jmdict',
        q: `${query}`,
        limit: 2,
      }
    ];
  }

  return jmdictQueries;
}