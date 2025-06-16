import { useEffect, useMemo } from 'react';
import { usePitchAccent } from '@/lib/hooks/use-pitch-accent';
import { SubtitleCue } from '@/types/subtitle';
import { NHKEntry } from '@/types/nhk';

export function useSubtitlesPitchAccent(upcomingSubtitles: SubtitleCue[]) {
  // Extract unique text from upcoming subtitles and create a query string
  const pitchQuery = useMemo(() => {
    if (!upcomingSubtitles.length) return '';
    
    const allTexts = upcomingSubtitles
    .flatMap(cue => cue.tokens?.filter(t => t.pos != '記号')?.flatMap(t => t.surface_form))
    .filter(Boolean); // Remove empty texts
    
    // Remove duplicates and join with comma
    const uniqueTexts = [...new Set(allTexts)];
    return uniqueTexts.join(',');
  }, [upcomingSubtitles]);

  const { pitch, isLoading, error, loadingDuration } = usePitchAccent(pitchQuery);

  const pitchLookup = useMemo(() => {
    if(!pitch) return new Map<string, NHKEntry>()
    const lookup = new Map<string, NHKEntry>();
    pitch.forEach((pitchData) => lookup.set(pitchData.word, pitchData));
    return lookup;
  }, [pitch, pitchQuery]);

  return {
    pitchLookup,
    isLoading,
    error,
    loadingDuration,
  };
}