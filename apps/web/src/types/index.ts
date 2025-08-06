export type Option = {
    value: string;
    label: string;
};

export type AuthProvider = 'anilist'

export type SyncStrategy = 'always' | 'ask' | 'never' | 'once'

export type NetworkCondition = 'good'|'poor'|'n'

export type CacheKey = string;

export type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};