import { isKanji } from "wanakana";
import { Query } from "../types/dictionary";

export function getKanjidic2Queries(query: string): Query[] {
  let kanjiQueries: Query[] = [];
  const letters: string[] = query.split('');
  letters.map(letter => {
    if(isKanji(letter)) kanjiQueries.push({
      indexUid: 'kanjidic2',
      q: `"${letter}"`,
      limit: 5,
      filter: [
        `literal = ${letter}`
      ]
    })
  })

  return kanjiQueries
}