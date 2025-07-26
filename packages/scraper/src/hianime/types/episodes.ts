import type { HianimeAnimeTitle } from "./anime";

export type GetHianimeEpisodesProps = {
  animeId: string
}

export type HianimeEpiosdeListApiReponse = {
  status: boolean;
  html: string;
  totalItems: 24,
  continueWatch: any
}

export type HianimeAnimeEpisode = {
  id: number;
  title: Partial<HianimeAnimeTitle>;
  number: number;
  isFiller: boolean;
}