import { Word } from "@/lib/db/schema";

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