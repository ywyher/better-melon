import { History } from "@/lib/db/schema";

export type ActivityHistoryEntry = {
  date: string;
  count: number;
  level: number;
  medias: History[]
}

export type HistoryPagination = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}