// AnilistResponse<'Page', { media: Anime[] }>
export type AnilistResponse<Key extends string, T> = {
  [K in Key]: T
}

export type AnilistEdges<T> = {
  edges: T[]
}