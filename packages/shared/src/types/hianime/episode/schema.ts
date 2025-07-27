import { Type as t } from "@sinclair/typebox"
import { hianimeTitle } from "../anime/schema"

export const hianimeEpisode = t.Object({
  id: t.Number(),
  number: t.Number(),
  title: t.Partial(hianimeTitle),
  isFiller: t.Boolean(),
})