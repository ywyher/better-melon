export type Option = {
    value: string;
    label: string;
};

export type SyncStrategy = 'always' | 'ask' | 'never' | 'once'

export type NetworkCondition = 'good'|'poor'|'n'

export type CacheKey = string;