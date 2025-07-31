import { useState, useCallback } from 'react';
import { useDefinitionStore } from '@/lib/stores/definition-store';
import { useDelayStore } from '@/lib/stores/delay-store';
import { SubtitleToken, SubtitleTranscription } from '@/types/subtitle';
import { SubtitleSettings } from '@/lib/db/schema';
import { getSentencesForCue, isTokenExcluded } from '@/lib/utils/subtitle';
import { getPitchAccent } from '@/lib/utils/pitch';
import { PitchAccents } from '@/types/pitch';
import { useTranscriptionStore } from '@/lib/stores/transcription-store';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { useLearningStore } from '@/lib/stores/learning-store';

export const useTranscriptionItem = (transcription: SubtitleTranscription) => {
  const delay = useDelayStore((state) => state.delay);
  
  const activeToken = useDefinitionStore((state) => state.token);
  const setSentences = useDefinitionStore((state) => state.setSentences);
  const setToken = useDefinitionStore((state) => state.setToken);
  const storeToken = useDefinitionStore((state) => state.token);

  const pitchLookup = useLearningStore((state) => state.pitchLookup);
  const wordsLookup = useLearningStore((state) => state.wordsLookup);
  
  const showFurigana = useSettingsStore((settings) => settings.subtitle.showFurigana);
  const definitionTrigger = useSettingsStore((settings) => settings.subtitle.definitionTrigger);
  const learningStatus = useSettingsStore((settings) => settings.word.learningStatus);
  const pitchColoring = useSettingsStore((settings) => settings.word.pitchColoring);
  const transcriptionsLookup = useTranscriptionStore((state) => state.transcriptionsLookup);
  
  const [hoveredTokenId, setHoveredTokenId] = useState<string | number | null>(null);
  const [hoveredCueId, setHoveredCueId] = useState<number | null>(null);
  
  const handleTokenMouseEnter = useCallback((cueId: number, tokenId: string | number) => {
    setHoveredCueId(cueId);
    setHoveredTokenId(tokenId);
  }, []);

  const handleTokenMouseLeave = useCallback(() => {
    setHoveredCueId(null);
    setHoveredTokenId(null);
  }, []);

  const handleActivate = useCallback((
    from: number,
    to: number,
    token: SubtitleToken,
    trigger: SubtitleSettings['definitionTrigger']
  ) => {
    if (
      !from ||
      !to ||
      !token ||
      transcription == 'english' ||
      definitionTrigger != trigger ||
      isTokenExcluded(token)
    ) return;

    if (storeToken && storeToken.id === token.id) {
      setToken(null);
      setSentences({
        kanji: null,
        kana: null,
        english: null,
      });
    } else {
      setToken(token);
      const sentences = getSentencesForCue(transcriptionsLookup, from, to, delay);
      setSentences(sentences);
    }
  }, [storeToken, setToken, setSentences, transcription, definitionTrigger, transcriptionsLookup, delay]);

  const getTokenAccent = useCallback((token: SubtitleToken): PitchAccents | null => {
    const pitch = pitchLookup.get(token.original_form);
    if (!pitch) return null;
    
    return getPitchAccent({
      position: pitch.pitches[0].position,
      reading: token.original_form
    });
  }, [pitchLookup]);

  const isTokenActive = useCallback((cueId: number, tokenId: string | number) => {
    return (hoveredCueId === cueId && hoveredTokenId === tokenId && transcription !== 'english')
      || tokenId === activeToken?.id;
  }, [hoveredCueId, hoveredTokenId, transcription, activeToken]);

  return {
    showFurigana,
    learningStatus,
    pitchColoring,
    definitionTrigger,
    pitchLookup,
    wordsLookup,
    transcriptionsLookup,
    
    hoveredTokenId,
    hoveredCueId,
    
    handleTokenMouseEnter,
    handleTokenMouseLeave,
    handleActivate,
    
    getTokenAccent,
    isTokenActive,
  };
};
