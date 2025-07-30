import { t } from "elysia";

export const nhkPitch = t.Object({
  position: t.Number(),
  devoice: t.Array(t.Number()),
  nasal: t.Array(t.Number()),
})

export const nhkEntry = t.Object({
  word: t.String(),
  type: t.String(),
  reading: t.String(),
  pitches: t.Array(nhkPitch)
})

export const nhkSearchResponse = t.Object({
  entries: t.Array(nhkEntry)
})

export type NHKEntry = typeof nhkEntry.static
export type NHKPitch = typeof nhkPitch.static
export type NHKSearchResponse = typeof nhkSearchResponse.static