import { SubtitleSettings } from "@/lib/db/schema";
import { SubtitlesNotAvailableError } from "@/lib/errors/player";
import { useSubtitleStore } from "@/lib/stores/subtitle-store";
import { getActiveSubtitleFile, getEnglishSubtitleUrl } from "@/lib/utils/subtitle";
import { CachedFiles } from "@/types/subtitle";
import { StreamingData } from "@better-melon/shared/types";
import { useEffect, useState } from "react";

type UseSetSubtitlesProps = {
  streamingData: StreamingData | null | undefined, 
  preferredFormat: SubtitleSettings['preferredFormat'] | null, 
  episodeNumber: number
  cachedFiles: CachedFiles
}

export const useSetSubtitles = ({
  streamingData,
  episodeNumber,
  preferredFormat,
  cachedFiles
}: UseSetSubtitlesProps) => {
  const activeSubtitleFile = useSubtitleStore((state) => state.activeSubtitleFile);
  const setActiveSubtitleFile = useSubtitleStore((state) => state.setActiveSubtitleFile);
  const englishSubtitleUrl = useSubtitleStore((state) => state.englishSubtitleUrl);
  const setEnglishSubtitleUrl = useSubtitleStore((state) => state.setEnglishSubtitleUrl);
  
  const [subtitlesErrorDialog, setSubtitlesErrorDialog] = useState<boolean>(false);
  const [subtitlesError, setSubtitlesError] = useState<Error | null>(null);

  const resetSubtitlesErrors = () => {
    setSubtitlesErrorDialog(false);
    setSubtitlesError(null);
  };

  useEffect(() => {
    if (
      !streamingData
    ) return;

    setSubtitlesErrorDialog(false);
    setSubtitlesError(null);

    if (streamingData.episode.sources.tracks && !englishSubtitleUrl) {
      const englishSub = getEnglishSubtitleUrl({
        files: streamingData.episode.sources.tracks,
        // url
        match: cachedFiles.english
      })
      setEnglishSubtitleUrl(englishSub);
    }

    if (streamingData.episode.subtitles.length > 0) {
      const file = getActiveSubtitleFile({
        preferredFormat,
        files: streamingData.episode.subtitles,
        // name
        matchPattern: cachedFiles.japanese
      });
      if (file && file !== activeSubtitleFile) { // Only update if different
        setActiveSubtitleFile(file);
        setSubtitlesError(null);
      } else if (!file) {
        setSubtitlesErrorDialog(true);
        setSubtitlesError(new SubtitlesNotAvailableError(episodeNumber));
      }
    } else {
      if (!activeSubtitleFile) {
        setSubtitlesErrorDialog(true);
        setSubtitlesError(new SubtitlesNotAvailableError(episodeNumber));
      }
    }
  }, [
    streamingData, 
    preferredFormat, 
    episodeNumber, 
    englishSubtitleUrl
  ]);

  return {
    subtitlesError,
    subtitlesErrorDialog,
    setSubtitlesErrorDialog,
    resetSubtitlesErrors
  };
};