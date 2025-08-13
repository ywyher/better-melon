import { History } from "@/lib/db/schema";

export type ActivityHistoryEntry = {
  date: string;
  count: number;
  level: number;
  medias: History[]
}