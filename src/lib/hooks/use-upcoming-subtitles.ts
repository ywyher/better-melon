import { useCallback, useEffect, useRef, useState } from 'react';
import { SubtitleCue } from '@/types/subtitle';
import { useMediaState } from '@vidstack/react';
import { useDelayStore } from '@/lib/stores/delay-store';
import { Subtitle, TranscriptionQuery } from '@/app/watch/[id]/[ep]/types';
import { usePlayerStore } from '@/lib/stores/player-store';

const config = {
  chunkSize: 5,
  lookAheadTime: 30,
}

export function useUpcomingSubtitles(transcriptions: TranscriptionQuery[], activeSubtitles: Subtitle) {
  const player = usePlayerStore((state) => state.player)
  const currentTime = useMediaState('currentTime', player);
  const delay = useDelayStore((state) => state.delay)
  const [upcomingSubtitles, setUpcomingSubtitles] = useState<SubtitleCue[]>([])
  
  // Track the last fetched position to avoid redundant fetches
  const lastFetchedTime = useRef<number>(-1);

  const fetchUpcomingUpcomingSubtitles = useCallback(() => {
    if (!currentTime || !transcriptions.length) return;

    const japaneseTranscription = transcriptions.find(t => t.transcription === 'japanese');
    if (!japaneseTranscription?.cues) return;

    const { cues } = japaneseTranscription;
    const transcriptionDelay = delay.japanese;
    const lookAheadTime = currentTime + config.lookAheadTime;

    // Find upcoming cues within the look-ahead window
    const upcomingCues = cues.filter(cue => {
        const startTime = cue.from + transcriptionDelay;
        return startTime > currentTime && startTime <= lookAheadTime;
    });

    // Group into upcomingSubtitles
    const upcomingSubtitles: SubtitleCue[][] = [];
    for (let i = 0; i < upcomingCues.length; i += config.chunkSize) {
      upcomingSubtitles.push(upcomingCues.slice(i, i + config.chunkSize));
    }

    setUpcomingSubtitles(upcomingSubtitles.flat());
    lastFetchedTime.current = currentTime;
    console.log(`Fetched upcoming upcomingSubtitles at time ${currentTime}:`, upcomingSubtitles);
  }, [currentTime, transcriptions, delay.japanese]);

  const shouldFetchUpcomingUpcomingSubtitles = useCallback(() => {
    if (!currentTime || !transcriptions.length) return false;
    
    // First time fetching
    if (lastFetchedTime.current === -1) return true;
    
    // If we've moved significantly forward in time (e.g., user seeked)
    const timeDifference = Math.abs(currentTime - lastFetchedTime.current);
    if (timeDifference > 10) return true; // 10 seconds threshold for seeking
    
    // Check if current active subtitle is the last one in our current upcomingSubtitles
    const japaneseActiveSubtitles = activeSubtitles.japanese;
    if (japaneseActiveSubtitles.length === 0) return false;
    
    const currentActiveSubtitle = japaneseActiveSubtitles[0]; // Assuming one active subtitle at a time
    const flattenedUpcomingSubtitles = upcomingSubtitles.flat();

    if (flattenedUpcomingSubtitles.length === 0) return true;
    
    // Find the last subtitle in our current upcomingSubtitles
    const lastUpcomingSubtitlesubtitle = flattenedUpcomingSubtitles[flattenedUpcomingSubtitles.length - 1];

    // If current active subtitle is close to or past the last chunked subtitle, fetch upcoming upcomingSubtitles
    const transcriptionDelay = delay.japanese;
    const currentSubtitleStart = currentActiveSubtitle.from + transcriptionDelay;
    const lastUpcomingSubtitlesubtitleStart = lastUpcomingSubtitlesubtitle.from + transcriptionDelay;
    
    // Trigger upcoming fetch when we're within 2 subtitles of the end of our current upcomingSubtitles
    const bufferSubtitles = 2;
    const isNearEnd = currentSubtitleStart >= (lastUpcomingSubtitlesubtitleStart - bufferSubtitles * 3);
    
    return isNearEnd;
  }, [currentTime, transcriptions, activeSubtitles.japanese, delay.japanese]);

  useEffect(() => {
    if (shouldFetchUpcomingUpcomingSubtitles()) {
      fetchUpcomingUpcomingSubtitles();
    }
  }, [shouldFetchUpcomingUpcomingSubtitles, fetchUpcomingUpcomingSubtitles]);


  return {
    upcomingSubtitles
  };
}