import { EpisodeData, JimakuFile, StreamingData } from "@/app/watch/[id]/[ep]/types";
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import { Poster } from '@vidstack/react';
import { Track, type TrackProps } from "@vidstack/react";

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { filterFiles, selectFile } from "@/app/watch/[id]/[ep]/funcs";

type TPlayer = { 
    streamingData: StreamingData;
    episodeData: EpisodeData
    japaneseSubs: JimakuFile[]
}

export default function Player({ streamingData, episodeData, japaneseSubs }: TPlayer) {
    const url = encodeURIComponent(streamingData?.sources[0].url);
    const uri = `${process.env.PROXY_URL}?url=${url}`;

    const filteredJpSubs = filterFiles(japaneseSubs)

    return (
        <div>
            <MediaPlayer
                title={episodeData.title}
                src={uri}
            >
                <MediaProvider>
                    <Poster
                        className="vds-poster"
                        src={episodeData.image}
                        alt={episodeData.title}
                    />
                    {filteredJpSubs.map((sub, idx) => (
                        <Track
                            key={sub.url}
                            src={sub.url}
                            kind="subtitles"
                            label={sub.name}
                            type={sub.url.split('.').pop() as "vtt" | "srt" | "ass"}
                            lang="jp-JP"
                            default={idx == 0 && true}
                        />
                    ))}
                    {streamingData.subtitles.map((sub, idx) => (
                        <Track
                            key={sub.url}
                            src={sub.url}
                            kind="subtitles"
                            label={sub.lang}
                            type={sub.url.split('.').pop() as "vtt" | "srt" | "ass"}
                            lang="en-US"
                        />
                    ))}
                </MediaProvider>
                <DefaultVideoLayout
                    thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt" 
                    icons={defaultLayoutIcons} 
                />
            </MediaPlayer>
        </div>
    )    
}