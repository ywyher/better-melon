import { Type as t } from "@sinclair/typebox" 

export const animeDate = t.Object({
  day: t.Number(),
  month: t.Number(),
  year: t.Number(),
})

export const animeProvider = t.Union([
  t.Literal('hianime')
],{
  error: {
    success: false,
    message: `Invalid provider. Supported providers: hianime`
  }
})