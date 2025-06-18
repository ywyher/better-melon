import { SubtitlesNotAvailableError } from "@/lib/errors/player";
import { useSubtitleStore } from "@/lib/stores/subtitle-store";
import { getActiveSubtitleFile } from "@/lib/utils/subtitle";
import { AnimeEpisodeData, AnimeStreamingLinks } from "@/types/anime";
import { SettingsForEpisode } from "@/types/settings";
import { useEffect, useState } from "react";

export const useSetSubtitles = (
  episodeData: AnimeEpisodeData | null | undefined, 
  settings: SettingsForEpisode | null | undefined, 
  episodeNumber: number
) => {
  const activeSubtitleFile = useSubtitleStore((state) => state.activeSubtitleFile);
  const setActiveSubtitleFile = useSubtitleStore((state) => state.setActiveSubtitleFile);
  const englishSubtitleUrl = useSubtitleStore((state) => state.englishSubtitleUrl);
  const setEnglishSubtitleUrl = useSubtitleStore((state) => state.setEnglishSubtitleUrl);
  
  const [subtitlesErrorDialog, setSubtitlesErrorDialog] = useState<boolean>(false);
  const [subtitlesError, setSubtitlesError] = useState<Error | null>(null);

  // Function to reset subtitle errors
  const resetSubtitlesErrors = () => {
    setSubtitlesErrorDialog(false);
    setSubtitlesError(null);
  };

  useEffect(() => {
    if (
      !episodeData ||
      !episodeData?.streamingLinks ||
      !settings ||
      !settings?.subtitleSettings
    ) return;

    setSubtitlesErrorDialog(false);
    setSubtitlesError(null);

    // Set English subtitle URL if available and not already set
    if (episodeData.streamingLinks.tracks && !englishSubtitleUrl) {
      const englishSub = episodeData.streamingLinks.tracks.find(
        (s: AnimeStreamingLinks['tracks'][0]) => s.label === 'English'
      )?.file || "";
      setEnglishSubtitleUrl(englishSub);
    }

    // Handle subtitle files
    if (episodeData.subtitles?.length > 0) {
      const file = getActiveSubtitleFile(
        episodeData.subtitles, 
        settings.subtitleSettings.preferredFormat
      );
      if (file && file !== activeSubtitleFile) { // Only update if different
        setActiveSubtitleFile(file);
        setSubtitlesError(null);
      } else if (!file) {
        setSubtitlesErrorDialog(true);
        setSubtitlesError(new SubtitlesNotAvailableError(episodeNumber));
      }
    } else {
      // No subtitles available
      if (!activeSubtitleFile) {
        setSubtitlesErrorDialog(true);
        setSubtitlesError(new SubtitlesNotAvailableError(episodeNumber));
      }
    }
  }, [
    episodeData, 
    settings, 
    episodeNumber, 
    englishSubtitleUrl
    // Removed activeSubtitleFile from dependencies to prevent infinite loop
  ]);

  return {
    subtitlesError,
    subtitlesErrorDialog,
    setSubtitlesErrorDialog,
    resetSubtitlesErrors
  };
};