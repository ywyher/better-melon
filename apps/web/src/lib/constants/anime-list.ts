import Anilist from "@/components/svg/anilist"
import { AnimeListProivder } from "@/types/anime-list"

export const animeListProviders: AnimeListProivder[] = [
  {
    name: 'anilist',
    icon: Anilist,
  }
]

export const anilistListStatusEnum = [
  'CURRENT',
  'PLANNING',
  'COMPLETED',
  'REPEATING',
  'PAUSED',
  'DROPPED'
] as const