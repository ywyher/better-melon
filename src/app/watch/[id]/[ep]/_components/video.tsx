import { StreamingData } from "@/app/watch/[id]/[ep]/types";
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import { PlayIcon } from '@vidstack/react/icons';
import { Poster } from '@vidstack/react';

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

export default function Video({ data }: { data: StreamingData }) {
      const url = encodeURIComponent(data?.sources[0].url);
      const headers = JSON.stringify({
            Referer: "https://zoro.to/", // Change this to the actual source website
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", // Spoof a browser
        });

        const uri = `http://localhost:8080/m3u8-proxy?url=${url}&headers=${encodeURIComponent(headers)}`;

    return (
        <div>
            <MediaPlayer
                title="Sprite Fight"
                src={uri}
            >
                <MediaProvider />
                <DefaultVideoLayout
                    thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt" 
                    icons={defaultLayoutIcons} 
                />
            </MediaPlayer>
        </div>
    )    
}