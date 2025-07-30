import { Type as t } from "@sinclair/typebox";

export const hianimeServerName = t.Union([
  t.Literal("hd-1"),
  t.Literal("hd-2"),
  t.Literal("hd-3"),
])

export const hianimeEpisodeServer = t.Object({
  id: t.Union([t.Number(), t.Null()]),
  dataId: t.Union([t.Number(), t.Null()]),
  name: hianimeServerName,
})

export const hianimeEpisodeServers = t.Object({
  sub: t.Array(hianimeEpisodeServer),
  dub: t.Array(hianimeEpisodeServer),
  raw: t.Array(hianimeEpisodeServer),
})