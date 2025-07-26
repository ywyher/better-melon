export type HianimeType = "MOVIE" | "TV" | "ONA" | "OVA" | "SPECIAL" | "MUSIC"
export type HianimeStatus = "FINISHED_AIRING" | "CURRENTLY_AIRING" | "NOT_YET_AIRED";
export type HianimeRated = "G" | "PG" | "PG-13" | "R" | "R+" | "Rx"
export type HianimeScore = "APPALLING" | "HORRIBLE" | "VERY_BAD" | "BAD" | "AVERAGE" | "FINE" | "GOOD" | "VERY_GOOD" | "GREAT" | "MASTERPIECE"
export type HianimeSeason = "SPRING" | "SUMMER" | "FALL" | "WINTER"
export type HianimeLanguage = "SUB" | "DUB" | "SUB_DUB"
export type HianimeSort =  "DEFAULT" | "RECENTLY_ADDED" | "RECENTLY_UPDATED" | "SCORE" | "NAME_AZ" | "RELEASED_DATE" | "MOST_WATCHED"
export type HianimeGenre =  "ACTION" | "ADVENTURE" | "CARS" | "COMEDY" | "DEMENTIA" | "DEMONS" | "DRAMA" | "ECCHI" | "FANTASY" | "GAME" | "HAREM" | "HISTORICAL" | "HORROR" | "ISEKAI" | "JOSEI" | "KIDS" | "MAGIC" | "MARTIAL_ARTS" | "MECHA" | "MILITARY" | "MUSIC" | "MYSTERY" | "PARODY" | "POLICE" | "PSYCHOLOGICAL" | "ROMANCE" | "SAMURAI" | "SCHOOL" | "SCI_FI" | "SEINEN" | "SHOUJO" | "SHOUJO_AI" | "SHOUNEN" | "SHOUNEN_AI" | "SLICE_OF_LIFE" | "SPACE" | "SPORTS" | "SUPER_POWER" | "SUPERNATURAL" | "THRILLER" | "VAMPIRE"
export type HianimeDate = {
  year: number;
  month: number;
  day: number
}

export type HianimeAnimeTitle = {
  english: string;
  native: string
}

export type HianimeAnime = {
  id: string;
  title: HianimeAnimeTitle;
  poster: string;
  duration: string;
  type: HianimeType;
  episodes: {
    sub: number;
    dub: number;
  };
}