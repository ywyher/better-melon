import { handleWord } from "@/app/settings/word/_known-words/actions";
import { getPitchAccent } from "@/lib/db/queries";
import { Word } from "@/lib/db/schema";
import { wordQueries } from "@/lib/queries/word";
import { useDefinitionStore } from "@/lib/stores/definition-store";
import { useLearningStore } from "@/lib/stores/learning-store";
import { useStreamingStore } from "@/lib/stores/streaming-store";
import { NHKPitch } from "@/types/nhk";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

type WordProps = {
  word: string
}

export function useWord({
  word
}: WordProps) {
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<Word['status'] | undefined>(undefined)

  const wordsLookup = useLearningStore((state) => state.wordsLookup)
  const setWordsLookup = useLearningStore((state) => state.setWordsLookup)

  const pitchLookup = useLearningStore((state) => state.pitchLookup)

  const animeId = useStreamingStore((state) => state.animeId)
  const animeEpisode = useStreamingStore((state) => state.episodeNumber)
  const animeTitle = useStreamingStore((state) => state.streamingData?.anime.title)
  const animeBanner = useStreamingStore((state) => state.streamingData?.anime.bannerImage)
  const timeRange = useDefinitionStore((state) => state.timeRange)

  const { data: wordData, isLoading: isWordDataLoading } = useQuery(wordQueries.word(word, newStatus))

  const saveWord = async (word: string, status: Word['status']) => {
    if(!animeId || !animeEpisode || !animeTitle || !animeBanner || !timeRange) {
      throw new Error("One of these is missing: animeId, animeEpisode, animeTitle, animeBanner, timeRange")
    }
    try {
      setIsActionLoading(true)

      let pitches: NHKPitch[];

      if (pitchLookup.size > 0) {
        const entry = pitchLookup.get(word);
        pitches = entry?.pitches ?? [];
      } else {
        const data = await getPitchAccent(word);
        pitches = data[0]?.pitches ?? [];
      }
      
      const { error, message } = await handleWord({ 
        word, 
        status, 
        pitches: pitches ? pitches : null,
        animeEpisode,
        animeId,
        animeTitle,
        animeBanner,
        timeRange
      });
      if(error) throw new Error(error);

      if(wordsLookup) {
        const newWordsLookup = new Map(wordsLookup);
        const exists = newWordsLookup.get(word);
        
        if(exists) {
          newWordsLookup.set(word, { word: exists.word, status });
        } else {
          newWordsLookup.set(word, { word, status });
        }
        
        setWordsLookup(newWordsLookup);
      }

      setNewStatus(status)
      toast.success(message)
    } catch(error) {
      const err = error instanceof Error ? error.message : 'Failed to set word status'
      toast.error(err)
    } finally {
      setIsActionLoading(false)
    }
  }

  return {
    status: wordData?.word?.status,
    isLoading: isActionLoading || isWordDataLoading,
    saveWord,
  }
}