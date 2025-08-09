import { Language3Letter, Tag, Xref } from "@/types/dictionary";
import { JMdictDictionaryMetadata } from "@/types/jmdict";

/**
 * JMnedict root object
 *
 * Differences from {@link JMdict} format (in {@link JMdictWord}):
 *
 * 1. `kanji` and `kana` have no `common` flag because in this dictionary
 *    priority data is missing (`ke_pri` and `re_pri` fields in JMdict,
 *    see {@link JMdictKanji}.common and {@link JMdictKana}.common)
 * 2. `translation` instead of `gloss`
 * 3. `translation->translation->lang` seems to be always empty because
 *    the original XML files have no data in corresponding attributes,
 *    even though documentation says otherwise. In this JSON version,
 *    `"eng"` (English) is always present as a default
 */
export interface JMnedict extends JMdictDictionaryMetadata {
    /**
     * List of dictionary entries/words
     */
    words: JMnedictWord[];
}
/**
 * JMdict entry/word
 */
export type JMnedictWord = {
    /**
     * Unique identifier of an entry
     */
    id: string;
    /**
     * Kanji (and other non-kana) writings.
     * Note that some words are only spelled with kana, so this may be empty.
     */
    kanji: JMnedictKanji[];
    /**
     * Kana-only writings of words.
     * If a kanji is also present, these can be considered as "readings",
     * but there are words written with kana only.
     */
    kana: JMnedictKana[];
    /**
     * Translations + some related data
     */
    translation: JMnedictTranslation[];
};
export type JMnedictKanji = {
    /**
     * The word itself, as spelled with any non-kana-only writing.
     *
     * @see {@link JMdictKanji}.text
     */
    text: string;
    /**
     * Tags applicable to this writing
     */
    tags: Tag[];
};
export type JMnedictKana = {
    /**
     * Kana-only writing, may only accidentally contain middle-dot
     * and other punctuation-like characters.
     */
    text: string;
    /**
     * Same as {@link JMnedictKanji}.tags
     */
    tags: Tag[];
    /**
     * List of kanji spellings of this word which this particular kana version applies to.
     * `"*"` means "all", an empty array means "none".
     * This field is useful for words will multiple kanji variants - some of them may be read
     * differently than others.
     */
    appliesToKanji: string[];
};
export type JMnedictTranslation = {
    /**
     * Name types, as specified in {@link JMnedict}.tags
     */
    type: Tag[];
    /**
     * References to related words
     */
    related: Xref[];
    /**
     * Translations
     */
    translation: JMnedictTranslationTranslation[];
};
export type JMnedictTranslationTranslation = {
    /**
     * Language of this translation
     */
    lang: Language3Letter;
    /**
     * A translation word/phrase
     */
    text: string;
};