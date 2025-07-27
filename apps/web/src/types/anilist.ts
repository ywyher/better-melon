import { AnilistAnime } from "@/types/anime";
import { AnilistAnimeCoverImage, AnilistAnimeFormat, AnilistAnimeStatus, AnilistAnimeTitle } from "@better-melon/shared/types";

export type AnilistAnimeChracterRole = "MAIN" | "SUPPORTING" | "BACKGROUND"

export type AnilistAnimeRelatoinType = "ADAPTATION" 
| "PREQUEL" 
| "SEQUEL" 
| "PARENT" 
| "SIDE_STORY" 
| "CHARACTER" 
| "SUMMARY" 
| "ALTERNATIVE" 
| "SPIN_OFF" 
| "OTHER" 
| "SOURCE" 
| "COMPILATION" 
| "CONTAINS" 

export type AnilistAnimeCountry = "JP" | "KR" | "TW" | "CN"

export type AnilistAnimeTrailer = {
  id: string;
  thumbnail: string;
  site: string
}

export type AnilistAnimeStudio = {
  isMain: boolean
  node: {
    name: string
  }
}

export type AnilistAnimeChracter = {
  role: AnilistAnimeChracterRole;
  node: {
    name: {
      first: string;
      last: string
    }
    image: {
      large: string
    }
    age: string;
  };
  voiceActors: {
    name: {
      first: string;
      last: string;
    }
    image: {
      large: string
    }
  }[]
}

export type AnilistAnimeRleation = {
  relationType: AnilistAnimeRelatoinType
  node: {
    id: AnilistAnime['id']
    coverImage: AnilistAnimeCoverImage
    title: AnilistAnimeTitle;
    status: AnilistAnimeStatus;
    format: AnilistAnimeFormat
  }
}

export type AnilistAnimeRecommendation = {
  node: {
    mediaRecommendation: {
      id: AnilistAnime['id']
      title: AnilistAnimeTitle;
      coverImage: AnilistAnimeCoverImage
      status: AnilistAnimeStatus
      format: AnilistAnimeFormat
      averageScore: AnilistAnime['averageScore']
      seasonYear: AnilistAnime['seasonYear']
    }
  }
}

export type AnilistAnimePageInfo = {
  hasNextPage: boolean
  currentPage: number
}

export type AnilistNode<T> = {
  node: T[]
}

export type AnilistEdges<T> = {
  edges: T[]
}