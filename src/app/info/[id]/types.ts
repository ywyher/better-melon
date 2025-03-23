import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

// types.ts
import { ApolloError } from "@apollo/client"

export interface Anime {
  id: number
  idMal?: number
  bannerImage?: string
  format?: string
  title: {
    romaji: string
    english?: string
  }
  episodes?: number
  coverImage?: {
    large?: string
  }
  description?: string
  genres?: string[]
  status?: string
  season?: string
  seasonYear?: number
}

export interface AnimeLayoutProps {
  bannerImage?: string
  title: string
  router: AppRouterInstance
  children: React.ReactNode
}

export interface AnimeInfoProps {
  coverImage?: string
  title: string
  format?: string
  status?: string
  season?: string
  seasonYear?: number
  genres?: string[]
}

export interface AnimeDescriptionProps {
  title: {
    romaji: string
    english?: string
  }
  description?: string
}

export interface AnimeEpisodesProps {
  episodes: number[]
  animeId: string
  router: AppRouterInstance
}

export interface AnimeErrorProps {
  error: ApolloError
}