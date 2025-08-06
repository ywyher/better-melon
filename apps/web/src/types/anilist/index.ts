export type AnilistPageInfo = {
  hasNextPage: boolean
  currentPage: number
}

export type AnilistNode<T> = {
  node: T[]
}

export type AnilistEdges<T> = {
  edges: T[]
}