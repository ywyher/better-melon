import { Anime, AnimeProvider } from "@/types/anime";
import { SubtitleFile } from "@/types/subtitle";
import { AnilistTitle, HianimeEpisodeSources, HianimeEpisodeSourcesTrack } from "@better-melon/shared/types";

export type EpisodesListViewMode = "grid" | "list" | "image"

export type EpisodeMetadata = {
  number: number;
  title: AnilistTitle['english'];
  image: string;
  description?: string;
  thumbnails?: HianimeEpisodeSourcesTrack;
}

export type EpisodeData = {
  provider: AnimeProvider;
  details: Anime;
  metadata: EpisodeMetadata;
  sources: HianimeEpisodeSources;
  subtitles: SubtitleFile[]
}