import { t } from "elysia";

// kanjidic2Codepoint
export const kanjidic2Codepoint = t.Object({
  type: t.Union([
    t.Literal('jis208'),
    t.Literal('jis212'),
    t.Literal('jis213'),
    t.Literal('ucs')
  ]),
  value: t.String()
});

// kanjidic2Radical
export const kanjidic2Radical = t.Object({
  type: t.Union([
    t.Literal('classical'),
    t.Literal('nelson_c')
  ]),
  value: t.Number()
});

// kanjidic2Variant
export const kanjidic2Variant = t.Object({
  type: t.Union([
    t.Literal('jis208'),
    t.Literal('jis212'),
    t.Literal('jis213'),
    t.Literal('deroo'),
    t.Literal('njecd'),
    t.Literal('s_h'),
    t.Literal('nelson_c'),
    t.Literal('oneill'),
    t.Literal('ucs')
  ]),
  value: t.String()
});

// kanjidic2Misc
export const kanjidic2Misc = t.Object({
  grade: t.Union([t.Number(), t.Null()]),
  strokeCounts: t.Array(t.Number()),
  variants: t.Array(kanjidic2Variant),
  frequency: t.Union([t.Number(), t.Null()]),
  radicalNames: t.Array(t.String()),
  jlptLevel: t.Union([t.Number(), t.Null()])
});

// kanjidic2DictionaryReferenceMorohashi
export const kanjidic2DictionaryReferenceMorohashi = t.Object({
  type: t.Literal('moro'),
  morohashi: t.Union([
    t.Object({
      volume: t.Number(),
      page: t.Number()
    }),
    t.Null()
  ]),
  value: t.String()
});

// kanjidic2DictionaryReferenceNotMorohashi
export const kanjidic2DictionaryReferenceNotMorohashi = t.Object({
  type: t.Union([
    t.Literal('nelson_c'),
    t.Literal('nelson_n'),
    t.Literal('halpern_njecd'),
    t.Literal('halpern_kkd'),
    t.Literal('halpern_kkld'),
    t.Literal('halpern_kkld_2ed'),
    t.Literal('heisig'),
    t.Literal('heisig6'),
    t.Literal('gakken'),
    t.Literal('oneill_names'),
    t.Literal('oneill_kk'),
    t.Literal('henshall'),
    t.Literal('sh_kk'),
    t.Literal('sh_kk2'),
    t.Literal('sakade'),
    t.Literal('jf_cards'),
    t.Literal('henshall3'),
    t.Literal('tutt_cards'),
    t.Literal('crowley'),
    t.Literal('kanji_in_context'),
    t.Literal('busy_people'),
    t.Literal('kodansha_compact'),
    t.Literal('maniette')
  ]),
  morohashi: t.Null(),
  value: t.String()
});

// kanjidic2DictionaryReference (union type)
export const kanjidic2DictionaryReference = t.Union([
  kanjidic2DictionaryReferenceMorohashi,
  kanjidic2DictionaryReferenceNotMorohashi
]);

// kanjidic2QueryCodeSkip
export const kanjidic2QueryCodeSkip = t.Object({
  type: t.Literal('skip'),
  skipMisclassification: t.Union([
    t.Literal('posn'),
    t.Literal('stroke_count'),
    t.Literal('stroke_and_posn'),
    t.Literal('stroke_diff'),
    t.Null()
  ]),
  value: t.String()
});

// kanjidic2QueryCodeNotSkip
export const kanjidic2QueryCodeNotSkip = t.Object({
  type: t.Union([
    t.Literal('sh_desc'),
    t.Literal('four_corner'),
    t.Literal('deroo'),
    t.Literal('misclass')
  ]),
  skipMisclassification: t.Null(),
  value: t.String()
});

// kanjidic2QueryCode (union type)
export const kanjidic2QueryCode = t.Union([
  kanjidic2QueryCodeSkip,
  kanjidic2QueryCodeNotSkip
]);

// kanjidic2Reading
export const kanjidic2Reading = t.Object({
  type: t.Union([
    t.Literal('pinyin'),
    t.Literal('korean_r'),
    t.Literal('korean_h'),
    t.Literal('vietnam'),
    t.Literal('ja_on'),
    t.Literal('ja_kun')
  ]),
  onType: t.Union([t.String(), t.Null()]),
  status: t.Union([t.String(), t.Null()]),
  value: t.String()
});

// kanjidic2Meaning
export const kanjidic2Meaning = t.Object({
  lang: t.String(),
  value: t.String()
});

// kanjidic2ReadingMeaningGroup
export const kanjidic2ReadingMeaningGroup = t.Object({
  readings: t.Array(kanjidic2Reading),
  meanings: t.Array(kanjidic2Meaning)
});

// kanjidic2ReadingMeaning
export const kanjidic2ReadingMeaning = t.Object({
  groups: t.Array(kanjidic2ReadingMeaningGroup),
  nanori: t.Array(t.String())
});

// Kradfile
export const kradfile = t.Object({
  version: t.String(),
  kanji: t.Record(t.String(), t.Array(t.String()))
});

// RadkfileRadicalInfo
export const radkfileRadicalInfo = t.Object({
  strokeCount: t.Number(),
  code: t.Union([t.String(), t.Null()]),
  kanji: t.Array(t.String())
});

// Radkfile
export const radkfile = t.Object({
  version: t.String(),
  radicals: t.Record(t.String(), radkfileRadicalInfo)
});

// kanjidic2Character
export const kanjidic2Character = t.Object({
  literal: t.String(),
  codepoints: t.Array(kanjidic2Codepoint),
  radicals: t.Array(kanjidic2Radical),
  misc: kanjidic2Misc,
  dictionaryReferences: t.Array(kanjidic2DictionaryReference),
  queryCodes: t.Array(kanjidic2QueryCode),
  readingMeaning: t.Union([kanjidic2ReadingMeaning, t.Null()])
});

// kanjidic2 root object
export const kanjidic2 = t.Object({
  characters: t.Array(kanjidic2Character)
});

// TypeScript type exports
export type Kanjidic2Type = typeof kanjidic2.static;
export type Kanjidic2CharacterType = typeof kanjidic2Character.static;
export type Kanjidic2CodepointType = typeof kanjidic2Codepoint.static;
export type Kanjidic2RadicalType = typeof kanjidic2Radical.static;
export type Kanjidic2VariantType = typeof kanjidic2Variant.static;
export type Kanjidic2MiscType = typeof kanjidic2Misc.static;
export type Kanjidic2DictionaryReferenceMorohashiType = typeof kanjidic2DictionaryReferenceMorohashi.static;
export type Kanjidic2DictionaryReferenceNotMorohashiType = typeof kanjidic2DictionaryReferenceNotMorohashi.static;
export type Kanjidic2DictionaryReferenceType = typeof kanjidic2DictionaryReference.static;
export type Kanjidic2QueryCodeSkipType = typeof kanjidic2QueryCodeSkip.static;
export type Kanjidic2QueryCodeNotSkipType = typeof kanjidic2QueryCodeNotSkip.static;
export type Kanjidic2QueryCodeType = typeof kanjidic2QueryCode.static;
export type Kanjidic2ReadingType = typeof kanjidic2Reading.static;
export type Kanjidic2MeaningType = typeof kanjidic2Meaning.static;
export type Kanjidic2ReadingMeaningGroupType = typeof kanjidic2ReadingMeaningGroup.static;
export type Kanjidic2ReadingMeaningType = typeof kanjidic2ReadingMeaning.static;
export type KradfileType = typeof kradfile.static;
export type RadkfileRadicalInfoType = typeof radkfileRadicalInfo.static;
export type RadkfileType = typeof radkfile.static;