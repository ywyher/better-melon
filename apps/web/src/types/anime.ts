import { AnilistAnimeChracter, AnilistAnimeRecommendation, AnilistAnimeRleation, AnilistAnimeStudio, AnilistAnimeTrailer, AnilistEdges } from "@/types/anilist"
import { AnilistAnimeCoverImage, AnilistAnimeFormat, AnilistAnimeSeason, AnilistAnimeSort, AnilistAnimeStatus, AnilistAnimeTitle, AnilistNextAiringEpisode, AnimeDate } from "@better-melon/shared/types"

export type AnimeSkipTime = {
  interval: {
    startTime: number;
    endTime: number;
  };
  skipType: "OP" | "OT";
};

export type AnimeProvider = 'hianime' 

export type AnilistAnime = {
  id: number | string;
  idMal: number | string;
  title: AnilistAnimeTitle;
  episodes: number;
  studios: AnilistEdges<AnilistAnimeStudio>;
  characters: AnilistEdges<AnilistAnimeChracter>;
  relations: AnilistEdges<AnilistAnimeRleation>;
  recommendations: AnilistEdges<AnilistAnimeRecommendation>;
  trailer: AnilistAnimeTrailer
  nextAiringEpisode: AnilistNextAiringEpisode | null
  coverImage: AnilistAnimeCoverImage;
  genres: string[];
  status: AnilistAnimeStatus;
  startDate: AnimeDate
  endDate: AnimeDate
  description: string;
  bannerImage: string;
  season: AnilistAnimeSeason;
  seasonYear: number;
  averageScore: number;
  isAdult: boolean;
  format: AnilistAnimeFormat;
  duration: number
}

export type AnilistAnimeInList = {
  id: number | string;
  format: AnilistAnimeFormat;
  title: AnilistAnimeTitle;
  bannerImage?: string
  coverImage: AnilistAnimeCoverImage
  description?: string
  averageScore?: number
  status?: AnilistAnimeStatus
  seasonYear?: number
}

export type AnilistAnimeInListVariables = { sort: AnilistAnimeSort; } & Partial<{
  page: number;
  perPage: number;
  status: AnilistAnimeStatus;
  includeDescription?: Boolean // = false
  includeBanner?: Boolean // = false
  includeMediumCover?: Boolean // = true
  includeLargeCover?: Boolean // = true
  includeExtraLargeCover?: Boolean // = false
  includeAverageScore?: Boolean // = false
  includeStatus?: Boolean // = false
  includeSeasonYear?: Boolean // = false
}>