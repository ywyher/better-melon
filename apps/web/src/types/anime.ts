import { queryVariables } from "@/lib/constants/anime";
import { AnilistChracter, AnilistCountry, AnilistEdges, AnilistRecommendation, AnilistRleation, AnilistStudio, AnilistTrailer } from "@/types/anilist";
import { AnilistCoverImage, AnilistFormat, AnilistGenre, AnilistNextAiringEpisode, AnilistSeason, AnilistSort, AnilistSource, AnilistStatus, AnilistTag, AnilistTitle, AnimeDate } from "@better-melon/shared/types";

export type AnimeSkipTime = {
  interval: {
    startTime: number;
    endTime: number;
  };
  skipType: "OP" | "OT";
};

export type AnimeProvider = 'hianime' 

export type Anime = {
  id: number;
  title: AnilistTitle;
  episodes: number;
  coverImage: AnilistCoverImage;
  genres: AnilistGenre[];
  status: AnilistStatus;
  description: string;
  bannerImage: string;
  season: AnilistSeason;
  seasonYear: number;
  averageScore: number;
  format: AnilistFormat;
  duration: number
  startDate: AnimeDate
  endDate: AnimeDate
  nextAiringEpisode: AnilistNextAiringEpisode | null
  studios: AnilistEdges<AnilistStudio>;
  characters: AnilistEdges<AnilistChracter>;
  relations: AnilistEdges<AnilistRleation>;
  recommendations: AnilistEdges<AnilistRecommendation>;
  trailer: AnilistTrailer
}

export type AnimeBasic = Pick<Anime, 'id' | 'title' | 'coverImage' | 'status'>
export type AnimeDynamic = Pick<Anime, 'id' | 'episodes' | 'nextAiringEpisode' | 'status'>

export type AnimeInfoHero = Pick<Anime, 
  | 'id'
  | 'title'
  | 'bannerImage'
  | 'coverImage'
  | 'averageScore'
  | 'status'
  | 'seasonYear'
  | 'format'
  | 'episodes'
  | 'genres'
  | 'duration'
>;

export type AnimeDetails = Pick<Anime,
  | 'id'
  | 'title'
  | 'status'
  | 'coverImage'
  | 'season'
  | 'seasonYear'
  | 'averageScore'
  | 'episodes'
  | 'format'
  | 'duration'
  | 'nextAiringEpisode'
  | 'bannerImage'
  | 'genres'
  | 'description'
  | 'studios'
  | 'startDate'
  | 'endDate'
  | 'characters'
  | 'relations'
  | 'recommendations'
  | 'trailer'
>;

export type AnimeInfo = AnimeInfoHero & AnimeDetails;

export type AnimeQueryVariableKeys = keyof typeof queryVariables.anime;
export type AnimeListQueryVariableKeys = keyof typeof queryVariables.list;

export type AnimeQueryVariables = Partial<{
  id: number;
  withTitle: boolean
  withCoverImage: boolean
  withFormat: boolean
  withStatus: boolean
  withSeason: boolean
  withSeasonYear: boolean
  withAverageScore: boolean
  withBannerImage: boolean
  withDescription: boolean
  withEpisodes: boolean
  withDuration: boolean
  withStartDate: boolean
  withEndDate: boolean
  withGenres: boolean
  withNextAiringEpisode: boolean
  withStudios: boolean
  withCharacters: boolean
  withRelations: boolean
  withRecommendations: boolean
  withTrailer: boolean
}>;

export type AnimeTopTrending = Pick<Anime,
  | "id"
  | "title"
  | "status"
  | "coverImage"
  | "bannerImage"
  | "seasonYear"
  | "description"
  | "format"
  | "averageScore"
>

export type AnimeInListHome = Pick<Anime,
  | "id"
  | "title"
  | "format"
  | "status"
  | "coverImage"
  | "seasonYear"
  | "averageScore"
>

export type AnimeListQueryVariables = Partial<{
  page: number;
  perPage: number;
  
  // filters
  sorts: AnilistSort[]
  status: AnilistStatus
  genres: AnilistGenre[]
  tags: AnilistTag[]
  seasonYear: number;
  format: AnilistFormat
  season: AnilistSeason
  isAdult: boolean
  source: AnilistSource
  countryOfOrigin: AnilistCountry
  averageScore: number
  query: string

  // metadata
  withTitle: boolean;
  withCoverImage: boolean;
  withFormat: boolean;
  withDescription: boolean;
  withBannerImage: boolean;
  withSeason: boolean;
  withSeasonYear: boolean;
  withAverageScore: boolean;
  withStatus: boolean;
  withGenres: boolean;
  withTags: boolean;
  withPopularity: boolean;
  withEpisodes: boolean;
}>