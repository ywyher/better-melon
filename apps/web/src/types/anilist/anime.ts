import { Anime } from "@/types/anime";
import { AnilistCoverImage, AnilistFormat, AnilistStatus, AnilistTitle } from "@better-melon/shared/types";

export type AnilistChracterRole = "MAIN" | "SUPPORTING" | "BACKGROUND"

export type AnilistRelationType = "ADAPTATION" 
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

export type AnilistCountry = "JP" | "KR" | "TW" | "CN"

export type AnilistTrailer = {
  id: string;
  thumbnail: string;
  site: string
}

export type AnilistStudio = {
  isMain: boolean
  node: {
    name: string
  }
}

export type AnilistChracter = {
  role: AnilistChracterRole;
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

export type AnilistRleation = {
  relationType: AnilistRelationType
  node: {
    id: Anime['id']
    coverImage: AnilistCoverImage
    title: AnilistTitle;
    status: AnilistStatus;
    format: AnilistFormat
  }
}

export type AnilistRecommendation = {
  node: {
    mediaRecommendation: {
      id: Anime['id']
      title: AnilistTitle;
      coverImage: AnilistCoverImage
      status: AnilistStatus
      format: AnilistFormat
      averageScore: Anime['averageScore']
      seasonYear: Anime['seasonYear']
    }
  }
}