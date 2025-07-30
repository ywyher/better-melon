import { TranscriptionQuery } from "@/app/watch/[id]/[ep]/types";
import { useActiveSubtitles } from "@/lib/hooks/use-active-subtitles";
import { useUpcomingSubtitles } from "@/lib/hooks/use-upcoming-subtitles";

export function useSubtitles(transcriptions: TranscriptionQuery[]) {
  const { activeSubtitles } = useActiveSubtitles(transcriptions);
  const { upcomingSubtitles } = useUpcomingSubtitles(
    transcriptions, 
    activeSubtitles
  );

  return {
    activeSubtitles,
    upcomingSubtitles
  };
}