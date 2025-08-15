import { Word } from "@/lib/db/schema";

export type WordFilters = {
  page: number
  limit: number;
} & Partial<{ 
  word: string;
  animeTitle: string;
  episodeNumber: number;
  status: Word['status']
}>