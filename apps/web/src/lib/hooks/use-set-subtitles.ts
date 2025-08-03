import { SubtitleSettings } from "@/lib/db/schema";
import { SubtitlesNotAvailableError } from "@/lib/errors/player";
import { useSubtitleStore } from "@/lib/stores/subtitle-store";
import { getActiveSubtitleFile, getEnglishSubtitleUrl } from "@/lib/utils/subtitle";
import { EpisodeData } from "@/types/episode";
import { CachedFiles } from "@/types/subtitle";
import { useEffect, useState } from "react";

type UseSetSubtitlesProps = {
  episodeData: EpisodeData | null | undefined, 
  preferredFormat: SubtitleSettings['preferredFormat'] | null, 
  episodeNumber: number
  cachedFiles: CachedFiles
}

export const useSetSubtitles = ({
  episodeData,
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
      !episodeData ||
      !episodeData?.sources ||
      !preferredFormat
    ) return;

    setSubtitlesErrorDialog(false);
    setSubtitlesError(null);

    if (episodeData.sources.tracks && !englishSubtitleUrl) {
      const englishSub = getEnglishSubtitleUrl({
        files: episodeData.sources.tracks,
        // url
        match: cachedFiles.english
      })
      setEnglishSubtitleUrl(englishSub);
    }

    if (episodeData.subtitles?.length > 0) {
      const file = getActiveSubtitleFile({
        preferredFormat,
        files: episodeData.subtitles,
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
    episodeData, 
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