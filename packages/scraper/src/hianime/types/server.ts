import type { HianimeEpisode } from "@better-melon/shared/types";

export type GetEpisodeServersProps = {
  episodeId: HianimeEpisode['id']
}

export type HianimeEpiosdeServersApiReponse = {
  status: boolean;
  html: string;
}

export type HianimeServerName = "hd-1" | "hd-2" | "hd-3"

export type HianimeEpisodeServer = {
  id: number | null;
  dataId: number | null; // will be used to get streaming links later
  name: HianimeServerName;
}