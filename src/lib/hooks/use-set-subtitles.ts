import { SubtitlesNotAvailableError } from "@/lib/errors/player";
import { usePlayerStore } from "@/lib/stores/player-store";
import { getActiveSubtitleFile } from "@/lib/subtitle/utils";
import { AnimeEpisodeData, AnimeStreamingLinks } from "@/types/anime";
import { SettingsForEpisode } from "@/types/settings";
import { useEffect, useState } from "react";

export const useSetSubtitles = (
  episodeData: AnimeEpisodeData | null | undefined, 
  settings: SettingsForEpisode | null | undefined, 
  episodeNumber: number
) => {
  const activeSubtitleFile = usePlayerStore((state) => state.activeSubtitleFile);
  const setActiveSubtitleFile = usePlayerStore((state) => state.setActiveSubtitleFile);
  const englishSubtitleUrl = usePlayerStore((state) => state.englishSubtitleUrl);
  const setEnglishSubtitleUrl = usePlayerStore((state) => state.setEnglishSubtitleUrl);
  
  const [subtitlesErrorDialog, setSubtitlesErrorDialog] = useState<boolean>(false);
  const [subtitleError, setSubtitleError] = useState<Error | null>(null);

  // Function to reset subtitle errors
  const resetSubtitleErrors = () => {
    setSubtitlesErrorDialog(false);
    setSubtitleError(null);
  };

  useEffect(() => {
    if (
      !episodeData ||
      !episodeData?.streamingLinks ||
      !settings ||
      !settings?.subtitleSettings
    ) return;

    setSubtitlesErrorDialog(false);
    setSubtitleError(null);

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
        setSubtitleError(null);
      } else if (!file) {
        setSubtitlesErrorDialog(true);
        setSubtitleError(new SubtitlesNotAvailableError(episodeNumber));
      }
    } else {
      // No subtitles available
      if (!activeSubtitleFile) {
        setSubtitlesErrorDialog(true);
        setSubtitleError(new SubtitlesNotAvailableError(episodeNumber));
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
    subtitleError,
    subtitlesErrorDialog,
    setSubtitlesErrorDialog,
    resetSubtitleErrors
  };
};