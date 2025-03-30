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