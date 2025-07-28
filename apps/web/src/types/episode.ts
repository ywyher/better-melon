import { Anime, AnimeProvider } from "@/types/anime";
import { SubtitleFile } from "@/types/subtitle";
import { AnilistTitle } from "@better-melon/shared/types";

export type EpisodesListViewMode = "grid" | "list" | "image"

export type EpisodeSubtitleTrack = {
  url: string;
  lang: string;
};

export type EpisodeSources = {
  headers: {
    Referer: string
  };
  tracks: EpisodeSubtitleTrack[];
  intro: {
    start: number;
    end: number
  };
  outro: {
    start: number;
    end: number
  };
  sources: {
    url: string;
    type: string
  }[];
  anilistId?: number;
  malId?: number
}

export type EpisodeMetadata = {
  number: number;
  title: AnilistTitle['english'];
  image: string;
  description?: string;
  thumbnails?: EpisodeSubtitleTrack;
}

export type EpisodeData = {
  provider: AnimeProvider;
  details: Anime;
  metadata: EpisodeMetadata;
  sources: EpisodeSources;
  subtitles: SubtitleFile[]
}