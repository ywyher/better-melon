import { useCallback, useEffect, useMemo } from 'react';
import { SubtitleCue, SubtitleTranscription } from '@/types/subtitle';
import { useMediaState } from '@vidstack/react';
import { useDelayStore } from '@/lib/stores/delay-store';
import { TranscriptionQuery } from '@/app/watch/[id]/[ep]/types';
import { usePlayerStore } from '@/lib/stores/player-store';

export function useActiveSubtitles(transcriptions: TranscriptionQuery[]) {
  const player = usePlayerStore((state) => state.player)
  const currentTime = useMediaState('currentTime', player);
  // const currentTime = 10
  const delay = useDelayStore((state) => state.delay)

  const getActiveSubtitleSets = useCallback(() => {
    if (!currentTime || !transcriptions.length) {
        return {
            japanese: [],
            hiragana: [],
            katakana: [],
            romaji: [],
            english: [],
        };
    };
    
    const result: Record<SubtitleTranscription, SubtitleCue[]> = {
        japanese: [],
        hiragana: [],
        katakana: [],
        romaji: [],
        english: [],
    };

    transcriptions.forEach(t => {
        if (t.cues) {
            const { transcription, cues } = t;
            const subtitleTranscription = transcription as SubtitleTranscription;
            
            const transcriptionDelay = ['english'].includes(subtitleTranscription) 
                ? delay.english 
                : delay.japanese;
            
            const currentTimePlusBuffer = currentTime;
            
            const activeCues = cues.filter(cue => {
                const startTime = cue.from + transcriptionDelay
                const endTime = cue.to + transcriptionDelay
                return currentTimePlusBuffer >= startTime && currentTimePlusBuffer <= endTime;
            });
            
            result[transcription] = activeCues;
        }
    });

    return result;
  }, [transcriptions, currentTime, delay]);

  const activeSubtitles = useMemo(() => getActiveSubtitleSets(), [getActiveSubtitleSets, transcriptions, currentTime]);

  return {
    activeSubtitles,
  };
}