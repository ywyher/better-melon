import { Type as t } from "@sinclair/typebox"

export const hianimeSort = t.Union([
  t.Literal("DEFAULT"),
  t.Literal("RECENTLY_ADDED"),
  t.Literal("RECENTLY_UPDATED"),
  t.Literal("SCORE"),
  t.Literal("NAME_AZ"),
  t.Literal("RELEASED_DATE"),
  t.Literal("MOST_WATCHED")
])

export const hianimeLanguage = t.Union([
  t.Literal("SUB"),
  t.Literal("DUB"),
  t.Literal("SUB_DUB")
])

export const hianimeStatus = t.Union([
  t.Literal("FINISHED"),
  t.Literal("NOT_YET_RELEASED"),
  t.Literal("RELEASING")
])

export const hianimeFormat = t.Union([
  t.Literal("TV"),
  t.Literal("MOVIE"),
  t.Literal("SPECIAL"),
  t.Literal("OVA"),
  t.Literal("ONA"),
  t.Literal("MUSIC") 
])

export const hianimeSeason = t.Union([
  t.Literal("SPRING"),
  t.Literal("FALL"),
  t.Literal("SUMMER"),
  t.Literal("WINTER"),
])

export const hianimeGenre =  t.Union([
  t.Literal("ACTION"),
  t.Literal("ADVENTURE"),
  t.Literal("CARS"),
  t.Literal("COMEDY"),
  t.Literal("DEMENTIA"),
  t.Literal("DEMONS"),
  t.Literal("DRAMA"),
  t.Literal("ECCHI"),
  t.Literal("FANTASY"),
  t.Literal("GAME"),
  t.Literal("HAREM"),
  t.Literal("HISTORICAL"),
  t.Literal("HORROR"),
  t.Literal("ISEKAI"),
  t.Literal("JOSEI"),
  t.Literal("KIDS"),
  t.Literal("MAGIC"),
  t.Literal("MARTIAL_ARTS"),
  t.Literal("MECHA"),
  t.Literal("MILITARY"),
  t.Literal("MUSIC"),
  t.Literal("MYSTERY"),
  t.Literal("PARODY"),
  t.Literal("POLICE"),
  t.Literal("PSYCHOLOGICAL"),
  t.Literal("ROMANCE"),
  t.Literal("SAMURAI"),
  t.Literal("SCHOOL"),
  t.Literal("SCI_FI"),
  t.Literal("SEINEN"),
  t.Literal("SHOUJO"),
  t.Literal("SHOUJO_AI"),
  t.Literal("SHOUNEN"),
  t.Literal("SHOUNEN_AI"),
  t.Literal("SLICE_OF_LIFE"),
  t.Literal("SPACE"),
  t.Literal("SPORTS"),
  t.Literal("SUPER_POWER"),
  t.Literal("SUPERNATURAL"),
  t.Literal("THRILLER"),
  t.Literal("VAMPIRE")
])

export const hianimeScore = t.Union([
  t.Literal("APPALLING"),
  t.Literal("HORRIBLE"),
  t.Literal("VERY_BAD"),
  t.Literal("BAD"),
  t.Literal("AVERAGE"),
  t.Literal("FINE"),
  t.Literal("GOOD"),
  t.Literal("VERY_GOOD"),
  t.Literal("GREAT"),
  t.Literal("MASTERPIECE")
])

export const hianimeRated = t.Union([
  t.Literal("G"),
  t.Literal("PG"),
  t.Literal("PG-13"),
  t.Literal("R"),
  t.Literal("R+"),
  t.Literal("Rx")
])

export const hianimeTitle = t.Object({
  english: t.String(),
  native: t.String()
})

export const hianimeAnime = t.Object({
  id: t.String(),
  title: hianimeTitle,
  poster: t.String(),
  duration: t.String(),
  format: hianimeFormat,
  episodes: t.Object({
    sub: t.Number(),
    dub: t.Number(),
  }),
})