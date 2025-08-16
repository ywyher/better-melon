import { Word } from "@/lib/db/schema";
import { Activity } from "react-activity-calendar";

export type WordsActivityEntry = Activity & {
  words: Word[]
}

export type WordFilters = {
  page: number
  limit: number;
} & Partial<{ 
  word: string;
  animeTitle: string;
  episodeNumber: number;
  date: {
    from: string;
    to: string;
  }
  status: Word['status']
}>