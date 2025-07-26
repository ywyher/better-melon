import { t } from "elysia";
import { xref } from "./shared";

export const jmdictLanguageSoruce = t.Object({
  lang: t.String(),
  full: t.Boolean(),
  wasei: t.Boolean(),
  text: t.Nullable(t.String())
})

export const jmdictGender = t.Union([
  t.Literal('masculine'),
  t.Literal('feminine'),
  t.Literal('neuter')
]);

export const jmdictGlossType = t.Union([
  t.Literal('literal'),
  t.Literal('figurative'),
  t.Literal('explanation'),
  t.Literal('trademark')
]);

export const jmdictGloss = t.Object({
  lang: t.String(), // Language3Letter is just a string
  gender: t.Union([jmdictGender, t.Null()]),
  type: t.Union([jmdictGlossType, t.Null()]),
  text: t.String()
});

export const jmdictSentence = t.Object({
  land: t.String(),
  text: t.String()
})

export const jmdictExample = t.Object({
  source: t.Object({
    type: t.String(),
    value: t.String()
  }),
  text: t.String(),
  sentences: t.Array(jmdictSentence)
})

export const jmdictKanji = t.Object({
  common: t.Boolean(),
  text: t.String(),
  tags: t.Array(t.String()),
})

export const jmdictKana = t.Object({
  common: t.Boolean(),
  text: t.String(),
  tags: t.Array(t.String()),
  appliesToKanji: t.Array(t.String())
})

export const jmdictSense = t.Object({
  partOfSpeech: t.Array(t.String()),
  appliesToKanji: t.Array(t.String()),
  appliesToKana: t.Array(t.String()),
  related: t.Array(xref),
  antonym: t.Array(xref),
  field: t.Array(t.String()),
  dialect: t.Array(t.String()),
  misc: t.Array(t.String()),
  info: t.Array(t.String()),
  languageSource: t.Array(jmdictLanguageSoruce),
  gloss: t.Array(jmdictGloss),
  examples: t.Array(jmdictExample)
})

export const jmdictWord = t.Object({
  id: t.String(),
  kanji: t.Array(jmdictKanji),
  kana: t.Array(jmdictKana),
  sense: t.Array(jmdictSense),
  isKana: t.Boolean()
})

export const jmdictSearchResponse = t.Object({
  entries: t.Array(jmdictWord),
})

export type JMdictSearchResponse = typeof jmdictSearchResponse.static
export type JmdictLanguageSoruce = typeof jmdictLanguageSoruce.static
export type JmdictGender = typeof jmdictGender.static
export type JmdictGlossType = typeof jmdictGlossType.static
export type JmdictGloss = typeof jmdictGloss.static
export type JmdictKanji = typeof jmdictKanji.static
export type JmdictKana = typeof jmdictKana.static
export type JmdictSense = typeof jmdictSense.static
export type JmdictWord = typeof jmdictWord.static