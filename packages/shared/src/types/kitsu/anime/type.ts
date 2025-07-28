export type KitsuAnimeEpisodesReponse = typeof kitsuAnimeEpisodesReponse.static
export type KitsuAnimeAttributes = typeof kitsuAnimeAttributes.static
export type KitsuAnimeInfo = typeof kitsuAnimeInfo.static
export type KitsuAnimeStatus = typeof kitsuAnimeStatus.static
export type KitsuAnimeDimensions = typeof kitsuAnimeDimensions.static
export type KitsuAnimeTitles = typeof kitsuAnimeTitles.static
export type KitsuAnimePoster = typeof kitsuAnimePoster.static
export type KitsuAnimeCover = typeof kitsuAnimeCover.static

export type KitsuAnimeEpisodeThumbnail = typeof kitsuAnimeEpisodeThumbnail.static
export type KitsuAnimeEpisodeAttributes = typeof kitsuAnimeEpisodeAttributes.static
export type KitsuAnimeEpisode = typeof kitsuAnimeEpisode.static

export type KitsuApiResponse<T> = {
  data: T
  meta: {
    count: number;
  }
}