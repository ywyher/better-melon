import { t } from "elysia";

export const datePattern = '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'; // YYYY-MM-DD

export const animeProvider = t.UnionEnum(['hianime'],{
  error: {
    success: false,
    message: `Invalid provider. Supported providers: hianime`
  }
})

export type AnimeProvider = typeof animeProvider.static

export interface ErrorResponse {
  success: false;
  message: string;
  status?: number;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}