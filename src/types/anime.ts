import { GeneralSettings, PlayerSettings, SubtitleSettings } from "@/lib/db/schema"
import { SubtitleFile } from "@/types/subtitle"

export type AnimeStatus = "CANCELLED" | "FINISHED" | "HIATUS" | "NOT_YET_RELEASED" | "RELEASING"
export type AnimeSeason = "SPRING" | "FALL" | "SUMMER" | "WINTER"
export type AnimeFormat = "TV" 
| "TV_SHORT" 
| "MOVIE" 
| "SPECIAL" 
| "OVA" 
| "ONA" 
| "MUSIC" 
| "MANGA" 
| "NOVEL" 
| "ONE_SHOT"
export type AnimeSource = "ORIGINAL"
| "MANGA"
| "LIGHT_NOVEL"
| "VISUAL_NOVEL"
| "VIDEO_GAME"
| "NOVEL"
| "DOUJINSHI"
| "ANIME"
| "WEB_NOVEL"
| "LIVE_ACTION"
| "GAME"
| "COMIC"
| "MULTIMEDIA_PROJECT"
| "PICTURE_BOOK"
| "OTHER"
export type AnimeSort = "ID"	
| "ID_DESC"	
| "TITLE_ROMAJI"	
| "TITLE_ROMAJI_DESC"	
| "TITLE_ENGLISH"	
| "TITLE_ENGLISH_DESC"	
| "TITLE_NATIVE"	
| "TITLE_NATIVE_DESC"	
| "TYPE"	
| "TYPE_DESC"	
| "FORMAT"	
| "FORMAT_DESC"	
| "START_DATE"	
| "START_DATE_DESC"	
| "END_DATE"	
| "END_DATE_DESC"	
| "SCORE"	
| "SCORE_DESC"	
| "POPULARITY"	
| "POPULARITY_DESC"	
| "TRENDING"	
| "TRENDING_DESC"	
| "EPISODES"	
| "EPISODES_DESC"	
| "DURATION"	
| "DURATION_DESC"	
| "STATUS"	
| "STATUS_DESC"	
| "CHAPTERS"	
| "CHAPTERS_DESC"	
| "VOLUMES"	
| "VOLUMES_DESC"	
| "UPDATED_AT"	
| "UPDATED_AT_DESC"	
| "SEARCH_MATCH"	
| "FAVOURITES"	
| "FAVOURITES_DESC"	
export type AnimeCountry = "JP" | "KR" | "TW" | "CN"

export interface AnimeTitle {
  english: string;
  romaji?: string;
  native?: string;
}

export interface AnimeCoverImage {
  large: string;
  medium: string;
  color?: string
}

export interface AnimeDate {
    day: number
    month: number
    year: number
}

export interface Anime {
  id: number | string;
  idMal: number | string;
  title: AnimeTitle;
  episodes: number;
  nextAiringEpisode: {
    episode: number
    timeUntilAiring: number
  } | null
  coverImage: AnimeCoverImage;
  genres: string[];
  status: AnimeStatus;
  startDate: AnimeDate
  endDate: AnimeDate
  description: string;
  bannerImage: string;
  season: AnimeSeason;
  seasonYear: number;
  averageScore: number;
  isAdult: boolean;
  format: string;
}

export type SkipTime = {
    interval: {
      startTime: number;
      endTime: number;
    };
    skipType: "OP" | "OT";
};

export type EpisodesListViewMode = "grid" | "list" | "image"

export type AnimeProvider = 'hianime' 

export type SubtitleTrack = {
  url: string;
  lang: string;
};

export type AnimeEpisodeSources = {
  headers: {
    Referer: string
  };
  tracks: SubtitleTrack[];
  intro: {
    start: number;
    end: number
  };
  outro: {
    start: number;
    end: number
  };
  sources: {
    url: string;
    type: string
  }[];
  anilistId?: number;
  malId?: number
}

export type AnimeEpisodeMetadata = {
  number: number;
  title: Anime['title']['english'];
  image: string;
  description?: string;
  thumbnails?: SubtitleTrack;
}

export type AnimeEpisodeData = {
  provider: AnimeProvider;
  details: Anime;
  metadata: AnimeEpisodeMetadata;
  sources: AnimeEpisodeSources;
  subtitles: SubtitleFile[]
}