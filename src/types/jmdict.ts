import { jmdictTags } from "@/lib/constants/jmdict";
import { DictionaryMetadata, Language3Letter, Tag, Xref } from "@/types/dictionary";

/**
 * Dictionary metadata, such as revisions and tags.
 */
export interface JMdictDictionaryMetadata extends DictionaryMetadata<Language3Letter> {
    /**
     * `true` if this file contains only common kana/kanji versions
     */
    commonOnly: boolean;
    /**
     * Revisions of JMdict file, as they appear in comments
     * in the original XML file header. These only contain
     * actual version (e.g., "1.08"), not a full comment.
     * Original comments also mention changes made,
     * but this is omitted in the resulting JSON files
     */
    dictRevisions: string[];
    /**
     * Tags: parts of speech, names of dialects, fields of application, etc.
     * All those things are expressed as XML entities in the original file.
     * Keys of this object are tags per se, and values are descriptions,
     * slightly modified from the original file
     */
    tags: {
        [tag: Tag]: string;
    };
}
/**
 * JMdict root object
 *
 * Important concepts:
 *
 * - "Kanji" and "kana" versions of words are not always equivalent
 *   to "spellings" and "readings" correspondingly. Some words are kana-only.
 *   You should treat "kanji" and "kana" as different ways of spelling,
 *   although when kanji versions are present, kana versions are indeed "readings" for those
 * - Some kana versions only apply to particular kanji versions, i.e. different spellings
 *   of the same word can be read in different ways. You'll see the `appliesToKanji` field
 *   being filled with a particular version in such cases
 * - "Sense" in JMdict refers to translations along with some other information.
 *   Sometimes, some "senses" only apply to some particular kanji/kana versions of a word,
 *   that's why you'll see fields `appliesToKanji` and `appliesToKana`.
 *   In {@link JMnedict}, translations are simply called "translations," there are no "senses"
 */
export interface JMdict extends JMdictDictionaryMetadata {
    /**
     * List of dictionary entries/words
     */
    words: JMdictWord[];
}
/**
 * JMdict entry/word
 */
export type JMdictWord = {
    /**
     * Unique identifier of an entry
     */
    id: string;
    /**
     * Kanji (and other non-kana) writings.
     * Note that some words are only spelled with kana, so this may be empty.
     */
    kanji: JMdictKanji[];
    /**
     * Kana-only writings of words.
     * If a kanji is also present, these can be considered as "readings",
     * but there are words written with kana only.
     */
    kana: JMdictKana[];
    /**
     * Senses = translations + some related data
     */
    sense: JMdictSense[];
};
export type JMdictKanji = {
    /**
     * `true` if this particular word is considered common.
     * This field combines all the `*_pri` fields
     * from original files in a same way as <https://jisho.org>
     * and other on-line dictionaries do (typically, some words have
     * "common" markers/tags). It gets rid of a bunch of `*_pri` fields
     * which are not typically used. Words marked with "news1", "ichi1",
     * "spec1", "spec2", "gai1" in the original file are treated as common,
     * which may or may not be true according to other sources.
     */
    common: boolean;
    /**
     * The word itself, as spelled with any non-kana-only writing.
     * May contain kanji, kana (but not only kana!), and some other characters.
     * Example: "ＣＤプレイヤー" - none of these symbols are kanji,
     * but "ＣＤ" is not kana, so it will be in this field. The corresponding
     * kana text will be "シーディープレイヤー", where "シーディー" is how the "ＣＤ"
     * is spelled in Japanese kana.
     */
    text: string;
    /**
     * Tags applicable to this writing
     */
    tags: Tag[];
};
export type JMdictKana = {
    /**
     * Same as {@link JMdictKanji}.common.
     * In this case, it shows that this particular kana transcription of a word
     * is considered common. For example, when a word can be read in multiple ways,
     * some of them may be more common than others.
     */
    common: boolean;
    /**
     * Kana-only writing, may only accidentally contain middle-dot
     * and other punctuation-like characters.
     */
    text: string;
    /**
     * Same as {@link JMdictKanji}.tags
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
export type JMdictSense = {
    /**
     * Parts of speech for this sense.
     *
     * In the original files, part-of-speech from the previous sense elements
     * may apply to the subsequent elements: e.g. if the 1st and 2nd elements
     * are both nouns, then only the 1st will state that explicitly.
     * This requires users to check the whole list of senses to correctly
     * determine part of speech for any particular sense.
     *
     * Unlike the original XML files, this field is never empty/missing.
     * Here, this field is "normalized" - parts of speech are present
     * in every element, even if they are all the same.
     */
    partOfSpeech: Tag[];
    /**
     * List of kanji writings within this word which this sense applies to.
     * Works in conjunction with the next `appliesToKana` field.
     * `"*"` means "all". This is never empty, unlike {@link JMdictKana}.appliesToKanji.
     */
    appliesToKanji: string[];
    /**
     * List of kana writings within this word which this sense applies to.
     * Works in conjunction with the previous `appliesToKanji` field.
     * "*" means "all". This is never empty, unlike {@link JMdictKana}.appliesToKanji.
     */
    appliesToKana: string[];
    /**
     * References to related words
     */
    related: Xref[];
    /**
     * References to antonyms of this word
     */
    antonym: Xref[];
    /**
     * List of fields of application of this word.
     * E.g. `"math"` means that this word is related to or used in Mathematics.
     */
    field: Tag[];
    /**
     * List of dialects where this word is used
     */
    dialect: Tag[];
    /**
     * Miscellanea - list of other tags which don't fit into other tag fields
     */
    misc: Tag[];
    /**
     * Other information about this word
     */
    info: string[];
    /**
     * Source language information for borrowed words and wasei-eigo.
     * Will be empty for words with Japanese origin (most of JMdict entries)
     */
    languageSource: JMdictLanguageSource[];
    /**
     * Translations of this word
     */
    gloss: JMdictGloss[];
    /**
     * Examples
     */
    examples: JMdictExample[]
};
/**
 * Source language information for borrowed words and wasei-eigo.
 * For borrowed words this will contain the original word/phrase,
 * in the source language
 */
export type JMdictLanguageSource = {
    /**
     * Language of this translation
     */
    lang: Language3Letter;
    /**
     * Indicates whether the sense element fully or partially
     * describes the source word or phrase of the loanword
     */
    full: boolean;
    /**
     * Indicates that the word is wasei-eigo.
     *
     * @see <https://en.wikipedia.org/wiki/Wasei-eigo>
     */
    wasei: boolean;
    /**
     * Text in the language defined by a `lang` field, or `null`
     */
    text: string | null;
};
/**
 * Gender
 */
export type JMdictGender = 'masculine' | 'feminine' | 'neuter';
/**
 * Sentence
 */
export type JMdictSentence = {
  land: string;
  text: string
}
/**
 * Example
 */
export type JMdictExample = {
  source: {
    type: string,
    value: number
  },
  text: string;
  sentences: JMdictSentence[]
}
/**
 * export type of translation
 */
export type JMdictGlossType = 'literal' | 'figurative' | 'explanation' | 'trademark';
/**
 * Translation of a word
 */
export type JMdictGloss = {
    /**
     * Language of this translation
     */
    lang: Language3Letter;
    /**
     * Gender.
     * Typically, for a noun in the target language.
     * When `null`, the gender is either not relevant or hasn't been provided.
     */
    gender: JMdictGender | null;
    /**
     * export type of translation.
     * Most words have `null` values, meaning this attribute was absent in the original XML entry.
     * Jmdict documentation does not describe the meaning of this attribute being absent.
     */
    type: JMdictGlossType | null;
    /**
     * A translation word/phrase
     */
    text: string;
};

export type JMdictPos = keyof typeof jmdictTags