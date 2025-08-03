import { AxiosRequestConfig, AxiosResponse } from "axios";
import { ErrorResponse } from "../types";
import client from "../lib/client";
import { redis } from "bun";
import { AnimeProvider, animeProvider } from "@better-melon/shared/types";

export const isValidProvider = (provider: string): provider is AnimeProvider => {
  return animeProvider.enum.includes(provider as AnimeProvider);
};

export function isErrorResponse(obj: unknown): obj is ErrorResponse {
  return typeof obj === 'object' && obj !== null && 'success' in obj && (obj as ErrorResponse).success === false;
}

export function createError(message: string, status?: number): ErrorResponse {
  return {
    success: false,
    message,
    status
  };
}

export function assertSuccess<T>(response: T | ErrorResponse): asserts response is T {
  if (isErrorResponse(response)) {
    throw new Error(response.message);
  }
}

interface RequestOptions {
  benchmark?: boolean;
  name: string;
  method?: 'GET' | 'POST';
  data?: any;
  headers?: Record<string, string>;
}

export async function makeRequest<T>(
  url: string,
  options: RequestOptions,
): Promise<AxiosResponse<T>> {
  const {
    benchmark = false,
    name,
    method = 'GET',
    data = undefined,
    headers = {},
  } = options;

  try {
    let fetchStart: number | undefined;
    if (benchmark) {
      fetchStart = performance.now();
    }

    let response;
    const config: AxiosRequestConfig = { headers };

    if (method === 'GET') {
      response = await client.get<T>(url, config);
    } else {
      response = await client.post<T>(url, data, config);
    }

    if (benchmark && fetchStart !== undefined) {
      const fetchEnd = performance.now();
      console.log(`${name} completed in ${(fetchEnd - fetchStart).toFixed(2)}ms`);
    }

    return response;
  } catch (error) {
    const errorMessage = `(${name}) Failed to fetch data: ${error instanceof Error ? error.message : 'Unknown error'}`;
    throw new Error(errorMessage);
  }
}

// DONT ASYNC THIS
export function setCache<T>({
  data,
  key,
  ttl = 3600,
  background = false
}: {
  key: string,
  data: T,
  ttl?: number,
  background?: boolean
}): Promise<void> | void {
  const startTime = performance.now();
  const cacheOperation = redis.set(key, JSON.stringify(data), 'EX', ttl);
  
  if (background) {
    cacheOperation
      .then(() => {
        const duration = (performance.now() - startTime).toFixed(2);
        console.log(`Background cache write successful for key: ${key} (${duration}ms)`);
      })
      .catch(error => {
        const duration = (performance.now() - startTime).toFixed(2);
        console.error(`Background cache write failed for key ${key} after ${duration}ms:`, error);
      });
    return;
  } else {
    return cacheOperation
      .then(() => {
        const duration = (performance.now() - startTime).toFixed(2);
        console.log(`Sync cache write successful for key: ${key} (${duration}ms)`);
      })
      .catch(error => {
        const duration = (performance.now() - startTime).toFixed(2);
        console.error(`Sync cache write failed for key ${key} after ${duration}ms:`, error);
        throw error;
      });
  }
}