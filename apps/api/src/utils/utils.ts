import { AxiosRequestConfig, AxiosResponse } from "axios";
import { AnimeProvider, ErrorResponse } from "../types";
import client from "../lib/client";
import { animeProviders } from "../lib/constants/constants";

export const isValidProvider = (provider: string): provider is AnimeProvider => {
  return animeProviders.includes(provider as AnimeProvider);
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