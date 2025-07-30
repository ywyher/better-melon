import { t } from "elysia";

export const index = t.UnionEnum([
  "jmdict",
  "jmnedict",
  "kanjidic2",
  'nhk'
],{
  error: {
    success: false,
    message: `Invalid provider. Supported providers: jmdict, jmnedict, kanjidic2`
  }
})

export type Index = typeof index.static