import { Type as t } from "@sinclair/typebox" 

export const animeDate = t.Object({
  day: t.Number(),
  month: t.Number(),
  year: t.Number(),
})