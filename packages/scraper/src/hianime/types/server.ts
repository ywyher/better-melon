import type { HianimeEpisode } from "@better-melon/shared/types";

export type GetEpisodeServersProps = {
  episodeId: HianimeEpisode['id']
}

export type HianimeEpiosdeServersApiReponse = {
  status: boolean;
  html: string;
}