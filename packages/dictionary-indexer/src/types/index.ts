import type { extensions } from "../lib/constants";
import type { GithubConfig } from "./github"
import type { Index } from "./indexes"

export type SupportedExtension = typeof extensions[number]

export type Folders = {
  downloads: string;
  extracts: string;
  dictionaries: string;
  dict: string
}

export type ProcessingType = 'none' | 'addExtraInfo' | 'editStructure';

export type ProcessingConfig = Partial<{
  type: ProcessingType;
  addIds: boolean;
  idField: string;
  startId: number
}>

export type SharedFileProperties = {
  filename: string;
  processing: ProcessingConfig;
  useSubdirectory?: boolean;
  requiresMerge?: boolean;
  mergeConfig?: { 
    extractedDir: string;
    flat: boolean;
  }
} 

export type RemoteFile = SharedFileProperties & {
  source: "remote";
  fallbackUrl: string;
  match: string;
  arrayToExtract: string;
}

export type LocalFile = SharedFileProperties & {
  source: "local";
}

export type File = RemoteFile | LocalFile;

export type IndexSettings = {
  distinctAttribute: string;
  rankingRules: string[];
  searchableAttributes: string[]
  sortableAttributes?: string[]
  filterableAttributes?: string[]
  typoTolerance?: {
    enabled: boolean;
    minWordSizeForTypos: {
      oneTypo: number,
      twoTypos: number
    }
  }
}

export type Meilisearch = {
  indexes: Record<Index, {
    name: Index,
    settings: IndexSettings;
  }>,
}

export type Config = {
  github: GithubConfig
  folders: Folders;
  files: Record<Index, File>
  meilisearch: Meilisearch
}

export type ProcessingResult<T = unknown> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
  code?: string;
}