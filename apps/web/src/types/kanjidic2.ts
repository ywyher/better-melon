import { DictionaryMetadata, Language2Letter } from "@/types/dictionary";

export interface Kanjidic2DictionaryMetadata extends DictionaryMetadata<Language2Letter> {
    /**
     * Version of the file, ordinal number.
     * The original XML file doesn't specify the meaning of this field.
     */
    fileVersion: number;
    /**
     * Format: YYYY-NN, where YYYY is a year, and NN is a zero-padded ordinal number (01, 02, ..., 99)
     */
    databaseVersion: string;
}

/**
 * Kanjidic root object
 */
export interface Kanjidic2 extends Kanjidic2DictionaryMetadata {
    /**
     * List of dictionary entries/characters
     */
    characters: Kanjidic2Character[];
}
export type Kanjidic2Character = {
    /**
     * Kanji itself
     */
    literal: string;
    /**
     * Kanji code in various encoding systems, such as Unicode or JIS
     */
    codepoints: Kanjidic2Codepoint[];
    /**
     * Radicals (i.e. "components" used for looking up kanji in dictionaries) of this kanji
     * Note that radicals don't necessarily represent all the component parts of a kanji,
     * but instead only describe some more distinctive parts. Radicals are used
     * to create indexes of kanji in dictionaries.
     */
    radicals: Kanjidic2Radical[];
    /**
     * Miscellanea data, such as school grade, JLPT level, usage frequency, etc.
     */
    misc: Kanjidic2Misc;
    /**
     * References to find this kanji in various dictionaries
     */
    dictionaryReferences: Kanjidic2DictionaryReference[];
    /**
     * Query codes to find this kanji in various (typically electronic) dictionaries.
     * Query code is typically a unique sequence of numbers and/or letters which
     * describes the shape of a kanji w/o relying on the knowledge of its
     * reading or meaning.
     */
    queryCodes: Kanjidic2QueryCode[];
    /**
     * Reading and meaning of a kanji, split into groups because different
     * readings can have different meanings.
     */
    readingMeaning: Kanjidic2ReadingMeaning | null;
};
export type Kanjidic2Codepoint = {
    /**
     * - jis208 - JIS X 0208-1997 - kuten coding, value format: nn-nn
     * - jis212 - JIS X 0212-1990 - kuten coding, value format: nn-nn
     * - jis213 - JIS X 0213-2000 - kuten coding, value format: p-nn-nn
     * - ucs - Unicode 4.0 - hex coding, value format: 4 or 5 hexadecimal digits
     */
    type: 'jis208' | 'jis212' | 'jis213' | 'ucs';
    value: string;
};
export type Kanjidic2Radical = {
    /**
     * - classical - based on the system first used in the KangXi Zidian.
     *   The Shibano "JIS Kanwa Jiten" is used as the reference source.
     * - nelson_c - as used in the Nelson "Modern Japanese-English
     *   Character Dictionary" (i.e. the Classic, not the New Nelson).
     *   This will only be used where Nelson reclassified the kanji.
     */
    type: 'classical' | 'nelson_c';
    value: number;
};
export type Kanjidic2Misc = {
    grade: number | null;
    /**
     * First value is the right count, the rest are common miscounts
     */
    strokeCounts: number[];
    /**
     * List of variants of this kanji. "Variants" typically kanji with the same
     * meaning but different shape, e.g. language-specific or simplified versions.
     */
    variants: Kanjidic2Variant[];
    /**
     * The rank of the character based on its frequency.
     * Only first 2,500 most used kanji, based on data of Japanese newspapers.
     */
    frequency: number | null;
    /**
     * Human-readable names of radical, if this kanji is also known as a radical
     * for other kanji. Most of the time this list is empty.
     */
    radicalNames: string[];
    /**
     * The (former) Japanese Language Proficiency Test (JLPT) level for this kanji.
     * 1 (most advanced) to 4 (most elementary).
     * Some kanji are not listed in JLPT.
     *
     * "Note that the JLPT test levels changed in 2010, with a new 5-level
     * system (N1 to N5) being introduced. No official kanji lists are
     * available for the new levels. The new levels are regarded as
     * being similar to the old levels except that the old level 2 is
     * now divided between N2 and N3."
     */
    jlptLevel: number | null;
};
export type Kanjidic2Variant = {
    /**
     * - jis208 - in JIS X 0208 - kuten coding
     * - jis212 - in JIS X 0212 - kuten coding
     * - jis213 - in JIS X 0213 - kuten coding
     * - deroo - De Roo number - numeric
     * - njecd - Halpern NJECD index number - numeric
     * - s_h - The Kanji Dictionary (Spahn & Hadamitzky) - descriptor
     * - nelson_c - "Classic" Nelson - numeric
     * - oneill - Japanese Names (O'Neill) - numeric
     * - ucs - Unicode codepoint - hexadecimal
     */
    type: 'jis208' | 'jis212' | 'jis213' | 'deroo' | 'njecd' | 's_h' | 'nelson_c' | 'oneill' | 'ucs';
    value: string;
};
/**
 * Special case for reference: Morohashi
 *
 * @see {@link Kanjidic2DictionaryReferenceNotMorohashi} for non-Morohashi types
 */
export type Kanjidic2DictionaryReferenceMorohashi = {
    /**
     * - moro - "Daikanwajiten" compiled by Morohashi. For some kanji two
     *   additional attributes are used: m_vol:  the volume of the
     *   dictionary in which the kanji is found, and m_page: the page
     *   number in the volume.
     *
     * @see {@link Kanjidic2DictionaryReferenceNotMorohashi} for non-Morohashi types
     */
    type: 'moro';
    morohashi: {
        volume: number;
        page: number;
    } | null;
    value: string;
};
export type Kanjidic2DictionaryReferenceNotMorohashi = {
    /**
     * - nelson_c - "Modern Reader's Japanese-English Character Dictionary",
     *   edited by Andrew Nelson (now published as the "Classic" Nelson).
     * - nelson_n - "The New Nelson Japanese-English Character Dictionary", edited by John Haig.
     * - halpern_njecd - "New Japanese-English Character Dictionary", edited by Jack Halpern.
     * - halpern_kkd - "Kodansha Kanji Dictionary", (2nd Ed. of the NJECD) edited by Jack Halpern.
     * - halpern_kkld - "Kanji Learners Dictionary" (Kodansha) edited by Jack Halpern.
     * - halpern_kkld_2ed - "Kanji Learners Dictionary" (Kodansha), 2nd edition
     *   (2013) edited by Jack Halpern.
     * - heisig - "Remembering The Kanji"  by  James Heisig.
     * - heisig6 - "Remembering The Kanji, Sixth Ed." by James Heisig.
     * - gakken - "A New Dictionary of Kanji Usage" (Gakken)
     * - oneill_names - "Japanese Names", by P.G. O'Neill.
     * - oneill_kk - "Essential Kanji" by P.G. O'Neill.
     * - moro - See {@link Kanjidic2DictionaryReferenceMorohashi}
     * - henshall - "A Guide To Remembering Japanese Characters" by Kenneth G. Henshall.
     * - sh_kk - "Kanji and Kana" by Spahn and Hadamitzky.
     * - sh_kk2 - "Kanji and Kana" by Spahn and Hadamitzky (2011 edition).
     * - sakade - "A Guide To Reading and Writing Japanese" edited by Florence Sakade.
     * - jf_cards - Japanese Kanji Flashcards, by Max Hodges and Tomoko Okazaki. (Series 1)
     * - henshall3 - "A Guide To Reading and Writing Japanese" 3rd
     *   edition, edited by Henshall, Seeley and De Groot.
     * - tutt_cards - Tuttle Kanji Cards, compiled by Alexander Kask.
     * - crowley - "The Kanji Way to Japanese Language Power" by Dale Crowley.
     * - kanji_in_context - "Kanji in Context" by Nishiguchi and Kono.
     * - busy_people - "Japanese For Busy People" vols I-III, published
     *   by the AJLT. The codes are the volume.chapter.
     * - kodansha_compact - the "Kodansha Compact Kanji Guide".
     * - maniette - codes from Yves Maniette's "Les Kanjis dans la tete" French adaptation of Heisig.
     *
     * 'moro' type is excluded on purpose
     *
     * @see {@link Kanjidic2DictionaryReferenceMorohashi} for Morohashi ('moro') type
     */
    type: 'nelson_c' | 'nelson_n' | 'halpern_njecd' | 'halpern_kkd' | 'halpern_kkld' | 'halpern_kkld_2ed' | 'heisig' | 'heisig6' | 'gakken' | 'oneill_names' | 'oneill_kk' | 'henshall' | 'sh_kk' | 'sh_kk2' | 'sakade' | 'jf_cards' | 'henshall3' | 'tutt_cards' | 'crowley' | 'kanji_in_context' | 'busy_people' | 'kodansha_compact' | 'maniette';
    morohashi: null;
    value: string;
};
/**
 * Dictionary references.
 *
 * This type is split into multiple cases for better type checking:
 *
 * - {@link Kanjidic2DictionaryReferenceMorohashi} - "Morohashi", has an optional additional field
 * - {@link Kanjidic2DictionaryReferenceNotMorohashi} - everything else
 */
export type Kanjidic2DictionaryReference = Kanjidic2DictionaryReferenceMorohashi | Kanjidic2DictionaryReferenceNotMorohashi;
/**
 * Special case for query code: skip
 *
 * @see {@link Kanjidic2QueryCodeNotSkip} for non-skip types
 */
export type Kanjidic2QueryCodeSkip = {
    /**
     * - skip -  Halpern's SKIP (System of Kanji Indexing by Patterns)
     *   code. The format is n-nn-nn. See the KANJIDIC documentation
     *   for a description of the code and restrictions on the
     *   commercial use of this data. [P] There are also
     *   a number of misclassification codes, indicated by the
     *   "skip_misclass" attribute.
     *
     * @see {@link Kanjidic2QueryCodeNotSkip} for non-skip types
     */
    type: 'skip';
    /**
     * - posn - a mistake in the division of the kanji
     * - stroke_count - a mistake in the number of strokes
     * - stroke_and_posn - mistakes in both division and strokes
     * - stroke_diff - ambiguous stroke counts depending on glyph
     */
    skipMisclassification: 'posn' | 'stroke_count' | 'stroke_and_posn' | 'stroke_diff' | null;
    value: string;
};
export type Kanjidic2QueryCodeNotSkip = {
    /**
     * - skip - See {@link Kanjidic2QueryCodeSkip}
     * - sh_desc - the descriptor codes for The Kanji Dictionary (Tuttle 1996)
     *   by Spahn and Hadamitzky. They are in the form nxnn.n,
     *   e.g. 3k11.2, where the kanji has 3 strokes in the
     *   identifying radical, it is radical "k" in the SH
     *   classification system, there are 11 other strokes, and it is
     *   the 2nd kanji in the 3k11 sequence. [I]
     * - four_corner - the "Four Corner" code for the kanji. This is a code
     *   invented by Wang Chen in 1928. See the KANJIDIC documentation
     *   for an overview of  the Four Corner System. [Q]
     * - deroo - the codes developed by the late Father Joseph De Roo, and
     *   published in  his book "2001 Kanji" (Bonjinsha). Fr De Roo
     *   gave his permission for these codes to be included. [DR]
     * - misclass - a possible misclassification of the kanji according
     *   to one of the code types. (See the "Z" codes in the KANJIDIC
     *   documentation for more details.)
     *
     * 'skip' type is excluded on purpose
     *
     * @see {@link Kanjidic2QueryCodeSkip} for 'skip' type
     */
    type: 'sh_desc' | 'four_corner' | 'deroo' | 'misclass';
    skipMisclassification: null;
    value: string;
};
/**
 * Query codes.
 *
 * This type is split into multiple cases for better type checking:
 *
 * - {@link Kanjidic2QueryCodeSkip} - "skip" code, has an optional additional field
 * - {@link Kanjidic2QueryCodeNotSkip} - everything else
 */
export type Kanjidic2QueryCode = Kanjidic2QueryCodeSkip | Kanjidic2QueryCodeNotSkip;
/**
 * Readings and meanings of kanji, split by groups
 */
export type Kanjidic2ReadingMeaning = {
    /**
     * Groups are required because different readings can have
     * different meanings.
     */
    groups: Kanjidic2ReadingMeaningGroup[];
    /**
     * Japanese readings that are now only associated with names.
     * (from jap. "名乗り", "to say or give one's own name")
     */
    nanori: string[];
};
/**
 * Reading/meaning group.
 *
 * Groups are required because different readings can have
 * different meanings.
 */
export type Kanjidic2ReadingMeaningGroup = {
    readings: Kanjidic2Reading[];
    meanings: Kanjidic2Meaning[];
};
export type Kanjidic2Reading = {
    /**
     * - pinyin - the modern PinYin romanization of the Chinese reading
     *   of the kanji. The tones are represented by a concluding digit. [Y]
     * - korean_r - the romanized form of the Korean reading(s) of the
     *   kanji. The readings are in the (Republic of Korea) Ministry
     *   of Education style of romanization. [W]
     * - korean_h - the Korean reading(s) of the kanji in hangul.
     * - vietnam - the Vietnamese readings supplied by Minh Chau Pham.
     * - ja_on - the "on" Japanese reading of the kanji, in katakana.
     *   Another attribute r_status, if present, will indicate with
     *   a value of "jy" whether the reading is approved for a
     *   "Jouyou kanji". (The r_status attribute is not currently used.)
     *   A further attribute on_type, if present, will indicate with
     *   a value of kan, go, tou or kan'you the type of on-reading.
     *   (The on_type attribute is not currently used.)
     * - ja_kun - the "kun" Japanese reading of the kanji, usually in hiragana.
     *   Where relevant the okurigana is also included separated by a
     *   "." (dot). Readings associated with prefixes and suffixes are
     *   marked with a "-" (minus/hyphen). A second attribute r_status, if present,
     *   will indicate with a value of "jy" whether the reading is
     *   approved for a "Jouyou kanji". (The r_status attribute is not currently used.)
     */
    type: 'pinyin' | 'korean_r' | 'korean_h' | 'vietnam' | 'ja_on' | 'ja_kun';
    /**
     * Indicates the type of on-reading: "kan", "go", "tou" or "kan'you".
     * Currently not used.
     */
    onType: string | null;
    /**
     * "jy" indicates the reading is approved for a "Jouyou kanji"
     * Currently not used.
     */
    status: string | null;
    value: string;
};
/**
 * Meaning usually refers to a historical usage of a kanji.
 * This sometimes doesn't represent the current usage.
 * For example, some kanji are not used as standalone words anymore,
 * or used in multiple words with unrelated meanings.
 */
export type Kanjidic2Meaning = {
    lang: Language2Letter;
    value: string;
};
/**
 * KRADFILE and KRADFILE2 are combined into a single file.
 * This is the only type you'll need.
 */
export interface Kradfile {
    /**
     * Version of jmdict-simplified project
     */
    version: string;
    /**
     * Map of: Kanji -> list of radicals/components
     */
    kanji: {
        [kanji: string]: string[];
    };
}
/**
 * RADKFILE and RADKFILE2 are combined into a single file.
 * (The "radkfilex" file from the source archive is used.)
 */
export interface Radkfile {
    /**
     * Version of jmdict-simplified project
     */
    version: string;
    /**
     * Map of: radical -> radical info, see {@link RadkfileRadicalInfo}
     */
    radicals: {
        [radical: string]: RadkfileRadicalInfo;
    };
}
/**
 * Radical info
 */
export type RadkfileRadicalInfo = {
    /**
     * Stroke count, integer > 0
     */
    strokeCount: number;
    /**
     * One of:
     *
     * - the JIS X 0212 code of the kanji whose glyph better depicts the element in question
     * - the name of an image file (used by the WWWJDIC server)
     */
    code: string | null;
    /**
     * Kanji which use this radical.
     */
    kanji: string[];
};