export type Option = {
    value: string;
    label: string;
};

export type Sub = {
    id: number;
    from: string;
    to: string;
    content: string;
    tokens?: Token[];
}

export type Token = {
    // Most used
    word_id: number;
    surface_form: string; // most important
    pos: string;
    basic_form: string;
    reading?: string | undefined;
    pronunciation?: string | undefined;

    // Extras
    word_type: string;
    word_position: number;
    pos_detail_1: string;
    pos_detail_2: string;
    pos_detail_3: string;
    conjugated_type: string;
    conjugated_form: string;
}

export type Format = 'srt' | 'vtt' | 'ass'
export type Mode = "japanese" | "hiragana" | "katakana" | "romaji"