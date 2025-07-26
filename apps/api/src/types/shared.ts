import { t } from "elysia";

/**
 * xref - Complete reference format: word + reading + sense index
 */
export const xrefWordReadingIndex = t.Tuple([
  t.String(), // kanji
  t.String(), // kana
  t.Number()  // senseIndex
]);

/**
 * xref - Shorter reference format: word + reading, without sense index
 */
export const xrefWordReading = t.Tuple([
  t.String(), // kanji
  t.String()  // kana
]);

/**
 * xref - Shorter reference format: word (can be kana-only or contain kanji) + sense index
 */
export const xrefWordIndex = t.Tuple([
  t.String(), // kanjiOrKana
  t.Number()  // senseIndex
]);

/**
 * xref - The shortest reference format: just the word (can be kana-only or contain kanji)
 */
export const xrefWord = t.Tuple([
  t.String() // kanjiOrKana
]);

/**
 * xref - Cross-reference
 *
 * Examples:
 * - `["丸", "まる", 1]` - refers to the word "丸", read as "まる" ("maru"),
 * specifically the 1st sense element
 * - `["○", "まる", 1]` - same as previous, but "○" is a special character
 * for the word "丸"
 * - `["二重丸", "にじゅうまる"]` - refers to the word "二重丸",
 * read as "にじゅうまる" ("nijoumaru")
 * - `["漢数字"]` - refers to the word "漢数字", with any reading
 */

export const xref = t.Union([
  xrefWordReadingIndex,
  xrefWordReading,
  xrefWordIndex,
  xrefWord
]);


export type XrefWordReadingIndex = typeof xrefWordReadingIndex.static
export type XrefWordReading = typeof xrefWordReading.static
export type XrefWordIndex = typeof xrefWordIndex.static
export type XrefWord = typeof xrefWord.static
export type Xref = typeof xref.static