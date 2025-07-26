import type { HianimeAnimeEpisode } from "./episodes";
import type { HianimeEpisodeServer } from "./servers";

export type GetHianimeEpisodeSourcesProps = {
  episodeId: HianimeAnimeEpisode['id'];
  server?: HianimeEpisodeServer;
  fallback?: boolean;
}

export type HianimeEpiosdeSourcesApiResponse = {
  type: string;
  link: string;
  server: number;
  sources: any[];
  tracks: any[];
  htmlGuide: string
}

export type ExtractHianimeTokenResults = {
  meta: string;
  dpi: string;
  nonce: string;
  comment: string;
  object: string;
  string: string;
}

export type HianimeTrack = {
  file: string;
  label: string;
  kind: string;
  default?: boolean
}

export type HianimeSource = {
  file: string;
  type: string;
}

export type HianimTimeSegment = {
  start: number;
  end: number;
}

export type HianimeGetSourcesApiResponse = {
  sources: string;
  tracks: HianimeTrack[];
  intro: HianimTimeSegment
  outro: HianimTimeSegment
  server: HianimeEpisodeServer['id']
  encrypted: boolean;
}

export type HianimeGetSourcesFallbackApiResponse = {
  sources: HianimeSource;
  tracks: HianimeTrack[];
  intro: HianimTimeSegment
  outro: HianimTimeSegment
  server: HianimeEpisodeServer['id']
}

export type HianimeEpisodeSources = {
  type: 'sub' | 'dub'
  sources: HianimeSource;
  tracks: HianimeTrack[];
  intro: HianimTimeSegment
  outro: HianimTimeSegment
  iframe: string;
  serverId: number // serverId
}