import { History } from "@/lib/db/schema";
import { Activity } from "react-activity-calendar";

export type HistoryActivityEntry = Activity & {
  animes: History[]
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