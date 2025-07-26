import { JMdictWord } from "@/types/jmdict";
import { JMnedictWord } from "@/types/jmnedict";
import { Kanjidic2Character } from "@/types/kanjidic2";

export type Dictionary = (
  | { index: 'jmdict'; entries: JMdictWord[] }
  | { index: 'jmnedict'; entries: JMnedictWord[] }
  | { index: 'kanjidic2'; entries: Kanjidic2Character[] }
)[]

export type Index = 'jmdict' | 'jmnedict' | 'kanjidic2'

/**
 * Language code, ISO 639-1 standard.
 * 2 letters: "en", "es", "fr"
 * @see <https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes>
 * @see <https://en.wikipedia.org/wiki/ISO_639-1>
 */
export type Language2Letter = string;
/**
 * Language code, ISO 639-2 standard.
 * 3 letters: "eng", "spa", "fra"
 * @see <https://en.wikipedia.org/wiki/ISO_639-2>
 */
export type Language3Letter = string;
export type Language = Language2Letter | Language3Letter;
/**
 * Dictionary metadata: version, languages, creation date
 */
export interface DictionaryMetadata<L extends Language> {
    /**
     * Semantic version of this project (not the dictionary itself).
     * For the dictionary revisions, see `dictRevisions` field below
     * @see <https://semver.org/>
     */
    version: string;
    /**
     * List of languages in this files
     */
    languages: L[];
    /**
     * Creation date of JMdict file, as it appears in a comment
     * with format "JMdict created: YYYY-MM-DD" in the original XML file header
     */
    dictDate: string;
}
/**
 * xref - Full reference format: word (kanji+kana) + reading (kana-only) + sense index (starting from 1)
 */
export type XrefWordReadingIndex = [
    kanji: string,
    kana: string,
    senseIndex: number
];
/**
 * xref - Shorter reference format: word + reading, without sense index
 */
export type XrefWordReading = [kanji: string, kana: string];
/**
 * xref - Shorter reference format: word (can be kana-only or contain kanji) + sense index
 */
export type XrefWordIndex = [kanjiOrKana: string, senseIndex: number];
/**
 * xref - The shortest reference format: just the word (can be kana-only or contain kanji)
 */
export type XrefWord = [kanjiOrKana: string];
/**
 * xref - Cross-reference
 *
 * Examples:
 * - `["丸", "まる", 1]` - refers to the word "丸", read as "まる" ("maru"),
 *   specifically the 1st sense element
 * - `["○", "まる", 1]` - same as previous, but "○" is a special character
 *    for the word "丸"
 * - `["二重丸", "にじゅうまる"]` - refers to the word "二重丸",
 *   read as "にじゅうまる" ("nijoumaru")
 * - `["漢数字"]` - refers to the word "漢数字", with any reading
 */
export type Xref = XrefWordReadingIndex | XrefWordReading | XrefWordIndex | XrefWord;
/**
 * tag - All tags are listed in a separate section of the file.
 * See the descriptions of the root JSON objects of each dictionary.
 *
 * Examples:
 * - `"v5uru"` - "Godan verb - Uru old class verb (old form of Eru)"
 * - `"n"` - "noun (common) (futsuumeishi)",
 * - `"tv"` - "television"
 */
export type Tag = string;