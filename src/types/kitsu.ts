export type KitsuAnimeTitles = {
  en: string;
  en_jp: string;
  en_us: string;
  ja_jp: string;
};

export type KitsuAnimeEpisodeThumbnail = {
  original: string;
};

export type KitsuAnimeEpisodeAttributes = {
  synopsis: string | null;
  description: string | null;
  titles?: Partial<KitsuAnimeTitles>;
  canonicalTitle: string | null;
  seasonNumber: number;
  number: number;
  relativeNumber: number | null;
  airdate: string | null;
  length: number; // duration
  thumbnail: KitsuAnimeEpisodeThumbnail | null;
  createdAt: string;
  updatedAt: string;
};

export type KitsuAnimeEpisode = {
  id: string;
  type: "episodes";
  links: {
    self: string;
  };
  attributes: KitsuAnimeEpisodeAttributes;
  relationships: any;
};

export type KitsuAnimeEpisodesReponse = {
  episodes: KitsuAnimeEpisode[]
  count: number
};