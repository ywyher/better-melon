import { AnilistAnime, AnimeProvider } from "@/types/anime";
import { SubtitleFile } from "@/types/subtitle";
import { AnilistAnimeTitle } from "@better-melon/shared/anilist/type";

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
  title: AnilistAnimeTitle['english'];
  image: string;
  description?: string;
  thumbnails?: EpisodeSubtitleTrack;
}

export type EpisodeData = {
  provider: AnimeProvider;
  details: AnilistAnime;
  metadata: EpisodeMetadata;
  sources: EpisodeSources;
  subtitles: SubtitleFile[]
}