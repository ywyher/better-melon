import { History } from "@/lib/db/schema";

export type ActivityHistoryEntry = {
  date: string;
  count: number;
  level: number;
  medias: History[]
}

export type HistoryFilters = {
  page: number
  limit: number;
} & Partial<{
  animeTitle: string
  date: {
    from: string;
    to: string;
  }
  page: number
}>