import { AnimeFormat, AnimeSeason, AnimeSort, AnimeSource, AnimeStatus } from "@/types/anime"

export const animeStatuses: AnimeStatus[] = [
    "CANCELLED",
    "FINISHED",
    "HIATUS",
    "NOT_YET_RELEASED",
    "RELEASING"
]

export const animeFormats: AnimeFormat[] = [
    "TV",
    "TV_SHORT",
    "MOVIE",
    "SPECIAL",
    "OVA",
    "ONA",
    "MUSIC",
    "MANGA",
    "NOVEL",
    "ONE_SHOT",
]

export const animeSeasons: AnimeSeason[] = [
    "FALL",
    "SPRING",
    "SUMMER",
    "WINTER"
]

export const animeSources: AnimeSource[] = [
    "ORIGINAL",
    "MANGA",
    "LIGHT_NOVEL",
    "VISUAL_NOVEL",
    "VIDEO_GAME",
    "OTHER",
    "NOVEL",
    "DOUJINSHI",
    "ANIME",
    "WEB_NOVEL",
    "LIVE_ACTION",
    "GAME",
    "COMIC",
    "MULTIMEDIA_PROJECT",
    "PICTURE_BOOK",
]

export const animeSort: AnimeSort[] = [
    "ID",	
    "ID_DESC",	
    "TITLE_ROMAJI",	
    "TITLE_ROMAJI_DESC",	
    "TITLE_ENGLISH",	
    "TITLE_ENGLISH_DESC",	
    "TITLE_NATIVE",	
    "TITLE_NATIVE_DESC",	
    "TYPE",	
    "TYPE_DESC",	
    "FORMAT",	
    "FORMAT_DESC",	
    "START_DATE",	
    "START_DATE_DESC",	
    "END_DATE",	
    "END_DATE_DESC",	
    "SCORE",	
    "SCORE_DESC",	
    "POPULARITY",	
    "POPULARITY_DESC",	
    "TRENDING",	
    "TRENDING_DESC",	
    "EPISODES",	
    "EPISODES_DESC",	
    "DURATION",	
    "DURATION_DESC",	
    "STATUS",	
    "STATUS_DESC",	
    "CHAPTERS",	
    "CHAPTERS_DESC",	
    "VOLUMES",	
    "VOLUMES_DESC",	
    "UPDATED_AT",	
    "UPDATED_AT_DESC",	
    "SEARCH_MATCH",	
    "FAVOURITES",	
    "FAVOURITES_DESC"	
]

export const animeCountries = [
    {
        value: "JP",
        label: "Japan"
    },
    {
        value: "KR",
        label: "South Korea"
    },
    {
        value: "TW",
        label: "Taiwan"
    },
    {
        value: "CN",
        label: "China"
    }
];