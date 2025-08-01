import { useCallback } from "react";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useDefinitionStore } from "@/lib/stores/definition-store";
import { useDelayStore } from "@/lib/stores/delay-store";
import { useSubtitleStore } from "@/lib/stores/subtitle-store";
import { SubtitleToken, SubtitleCue as TSubtitleCue } from "@/types/subtitle";
import { getSentencesForCue, isTokenExcluded, removeHtmlTags } from "@/lib/utils/subtitle";
import { toast } from "sonner";
import { getPitchAccent } from "@/lib/utils/pitch";
import { PitchAccents } from "@/types/pitch";
import { useTranscriptionStore } from "@/lib/stores/transcription-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { useLearningStore } from "@/lib/stores/learning-store";

export const useSubtitleCue = () => {
  const player = usePlayerStore((state) => state.player);
  
  const delay = useDelayStore((state) => state.delay);

  const activeSubtitleFile = useSubtitleStore((state) => state.activeSubtitleFile);

  const transcriptionsLookup = useTranscriptionStore((state) => state.transcriptionsLookup);

  const showFurigana = useSettingsStore((settings) => settings.subtitle.showFurigana);

  const pitchLookup = useLearningStore((state) => state.pitchLookup);
  
  const activeToken = useDefinitionStore((state) => state.token);
  const setSentences = useDefinitionStore((state) => state.setSentences);
  const setToken = useDefinitionStore((state) => state.setToken);
  const setIsAddToAnki = useDefinitionStore((state) => state.setIsAddToAnki);
  
  const handleSeek = useCallback((from: TSubtitleCue['from']) => {
    player.current?.remoteControl.seek(from + delay.japanese);
  }, [player, activeSubtitleFile, delay.japanese]);

  const handleTokenClick = useCallback((token: SubtitleToken, from: number, to: number) => {
    if (!token || !transcriptionsLookup || isTokenExcluded(token)) return;
    
    if (activeToken && activeToken.id === token.id) {
      // If clicking on the same token, clear it and the sentence
      setToken(null);
      setSentences({
        kanji: null,
        kana: null,
        english: null,
      });
    } else {
      // Otherwise set the new token and get sentences for all transcriptions
      setToken(token);
      const sentences = getSentencesForCue(transcriptionsLookup, from, to, delay);
      setSentences(sentences);
    }
    
    setIsAddToAnki(false);
  }, [activeToken, setToken, setSentences, setIsAddToAnki, transcriptionsLookup, delay]);

  const handleCopy = useCallback(async (sentence: string) => {
    if (!sentence) return;
    try {
      await navigator.clipboard.writeText(removeHtmlTags(sentence));
      toast.success("Cue copied to clipboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to copy cue`);
    }
  }, []);

  const getTokenAccent = useCallback((token: SubtitleToken): PitchAccents | null => {
    const pitch = pitchLookup.get(token.original_form);
    if (!pitch) return null;
    
    return getPitchAccent({
      position: pitch.pitches[0].position,
      reading: token.original_form
    });
  }, [pitchLookup]);

  return {
    activeToken,
    showFurigana,
    getTokenAccent,
    handleSeek,
    handleTokenClick,
    handleCopy,
  };
};