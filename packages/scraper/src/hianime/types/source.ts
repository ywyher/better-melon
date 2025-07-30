import type { HianimeEpisode, HianimeEpisodeServer, HianimeEpisodeSource, HianimeEpisodeSourcesTimeSegment, HianimeEpisodeSourcesTrack } from "@better-melon/shared/types";

export type GetHianimeEpisodeSourcesProps = {
  episodeId: HianimeEpisode['id'];
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

export type HianimeGetSourcesApiResponse = {
  sources: string;
  tracks: HianimeEpisodeSourcesTrack[];
  intro: HianimeEpisodeSourcesTimeSegment
  outro: HianimeEpisodeSourcesTimeSegment
  server: HianimeEpisodeServer['id']
  encrypted: boolean;
}

export type HianimeEpiosodeSourcesFallbackResponse = {
  sources: HianimeEpisodeSource;
  tracks: HianimeEpisodeSourcesTrack[];
  intro: HianimeEpisodeSourcesTimeSegment
  outro: HianimeEpisodeSourcesTimeSegment
  server: HianimeEpisodeServer['id']
}

export type HianimeEncryptedEpisodeSources = {
  sources: string;
  tracks: HianimeEpisodeSourcesTrack[];
  encrypted: boolean;
  intro: HianimeEpisodeSourcesTimeSegment;
  outro: HianimeEpisodeSourcesTimeSegment;
  server: number // serverId
}