import { t } from "elysia";

export const subtitleEntry = t.Object({
  id: t.Number(),
  name: t.String(),
  flags: t.Object({
    anime: t.Boolean(),
    unverified: t.Boolean(),
    external: t.Boolean(),
    movie: t.Boolean(),
    adult: t.Boolean(),
  }),
  last_modified: t.Union([t.String(), t.Date()]),
  anilist_id: t.Number(),
  english_name: t.String(),
  japanese_name: t.String()
})

export const subtitleFile = t.Object({
  url: t.String(),
  name: t.String(),
  size: t.Number(),
  last_modified: t.String()
})


export type SubtitleFile = typeof subtitleFile.static
export type SubtitleEntry = typeof subtitleEntry.static