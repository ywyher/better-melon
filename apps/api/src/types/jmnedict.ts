import { t } from 'elysia';
import { xref } from './shared';

export const JMnedictKanji = t.Object({
  text: t.String(),
  tags: t.Array(t.String())
});

export const JMnedictKana = t.Object({
  text: t.String(),
  tags: t.Array(t.String()),
  appliesToKanji: t.Array(t.String())
});

export const JMnedictTranslationTranslation = t.Object({
  lang: t.String(),
  text: t.String()
});

export const JMnedictTranslation = t.Object({
  type: t.Array(t.String()),
  related: t.Array(xref), // This assumes `Xref` is defined as a TypeBox schema
  translation: t.Array(JMnedictTranslationTranslation)
});

export const JMnedictWord = t.Object({
  id: t.String(),
  kanji: t.Array(JMnedictKanji),
  kana: t.Array(JMnedictKana),
  translation: t.Array(JMnedictTranslation)
});

export const JMnedict = t.Object({
  words: t.Array(JMnedictWord)
});

export type jmnedictKanji = typeof JMnedictKanji.static
export type jmnedictKana = typeof JMnedictKana.static
export type jmnedictTranslationTranslation = typeof JMnedictTranslationTranslation.static
export type jmnedictTranslation = typeof JMnedictTranslation.static
export type jmnedictWord = typeof JMnedictWord.static
export type jmnedict = typeof JMnedict.static