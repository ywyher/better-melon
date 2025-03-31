export type JimakuEntry = {
    id: number;
    name: string;
    flags: {
        anime: boolean;
        unverified: boolean;
        external: boolean;
        movie: boolean;
        adult: boolean;
    };
    last_modified: Date;
    anilist_id: number;
    english_name: string;
    japanese_name: string;
}

export type JimakuFile = {
    url: string;
    name: string;
    size: number;
    last_modified: Date;
}

export type EpisodeData = {
    id: string;
    title: string;
    image: string;
    imageHash: string;
    number: number;
    createdAt: Date;
    description?: string;
    url: string;
}

export type StreamingData = {
    intro: {
        start: number;
        end: number;
    };
    outro: {
        start: number;
        end: number;
    };
    sources: {
        url: string;
        isM3U8: boolean;
        type: 'hls'
    }[];
    subtitles: {
        url: string;
        lang: string;
    }[]
}

export type File = {
    name: string
    size: number
    url: string
    last_modified: Date
}