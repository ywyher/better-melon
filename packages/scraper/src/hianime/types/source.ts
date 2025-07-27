import type { HianimeEpisode, HianimeEpisodeSourcesTimeSegment, HianimeEpisodeSourcesTrack } from "@better-melon/shared/types";
import type { HianimeEpisodeServer } from "./server";

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

export type HianimeSource = {
  file: string;
  type: string;
}

export type HianimeGetSourcesApiResponse = {
  sources: string;
  tracks: HianimeEpisodeSourcesTrack[];
  intro: HianimeEpisodeSourcesTimeSegment
  outro: HianimeEpisodeSourcesTimeSegment
  server: HianimeEpisodeServer['id']
  encrypted: boolean;
}

export type HianimeGetSourcesFallbackApiResponse = {
  sources: HianimeSource;
  tracks: HianimeEpisodeSourcesTrack[];
  intro: HianimeEpisodeSourcesTimeSegment
  outro: HianimeEpisodeSourcesTimeSegment
  server: HianimeEpisodeServer['id']
}