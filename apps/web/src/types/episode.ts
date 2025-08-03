import { AnilistTitle, HianimeEpisodeSourcesTrack } from "@better-melon/shared/types";

export type EpisodesListViewMode = "grid" | "list" | "image"

export type EpisodeMetadata = {
  number: number;
  title: AnilistTitle['english'];
  image: string;
  description?: string;
  thumbnails?: HianimeEpisodeSourcesTrack;
}