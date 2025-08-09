import useHistory from "@/lib/hooks/use-history";
import { usePlayerStore } from "@/lib/stores/player-store";
import { Anime } from "@/types/anime";
import { AnilistCoverImage, AnilistTitle } from "@better-melon/shared/types";
import { useEffect, useRef } from "react";

type SaveProgressProps = {
  animeId: Anime['id'];
  episodeNumber: number;
  animeTitle?: AnilistTitle;
  animeCoverImage?: AnilistCoverImage;
}

export function useSaveProgress({
  animeId,
  episodeNumber,
  animeTitle,
  animeCoverImage,
}: SaveProgressProps) {
  const player = usePlayerStore((state) => state.player);

  const { handleSave } = useHistory();
  const lastSaveTimeRef = useRef<number>(0);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    if (
      !animeId 
      || episodeNumber === undefined 
      || !animeTitle
      || !animeCoverImage
      || !animeTitle 
      || !player.current
    ) {
      return;
    }

    const unsubscribe = player.current.subscribe(({ currentTime, duration, paused }) => {
      const now = Date.now();
      
      if (currentTime < 10 || paused || now - lastSaveTimeRef.current < 5000) {
        return;
      }

      lastSaveTimeRef.current = now;
      
      handleSave({
        mediaId: String(animeId),
        mediaEpisode: episodeNumber,
        mediaTitle: animeTitle,
        mediaCoverImage: animeCoverImage,
        duration,
        progress: currentTime
      });
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [animeId, episodeNumber, animeTitle, animeCoverImage, player, handleSave]);
}