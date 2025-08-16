import { History } from "@/lib/db/schema";
import z from "zod";

export type Option = {
    value: string;
    label: string;
};

export type AuthProvider = 'anilist'

export type SyncStrategy = 'always' | 'ask' | 'never' | 'once'

export type NetworkCondition = 'good'|'poor'|'n'

export type CacheKey = string;

export type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

export type Pagination = {
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  itemsPerPage?: number;
  totalPages?: number;
  totalItems?: number;
}

export const dateRangeSchema = z.object({
  from: z.string(),
  to: z.string(),
})