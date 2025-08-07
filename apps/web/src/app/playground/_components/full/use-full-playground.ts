import pitchQueries from './data/pitch.json'
import words from './data/words.json'
import transcriptionsQuery from './data/transcription.json'
import generalData from './data/streaming.json'
import settings from './data/settings.json'
import { useEffect, useMemo, useState } from "react";
import { NHKEntry } from "@/types/nhk";
import { TranscriptionQuery, WordsLookup } from "@/app/watch/[id]/[ep]/types";
import { Word } from "@/lib/db/schema";
import { SubtitleCue, SubtitleTranscription } from "@/types/subtitle";
import { getTranscriptionsLookupKey } from '@/lib/utils/subtitle';
import { useStreamingStore } from '@/lib/stores/streaming-store';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { useTranscriptionStore } from '@/lib/stores/transcription-store';
import { useLearningStore } from '@/lib/stores/learning-store';
import { useSetSubtitles } from '@/lib/hooks/use-set-subtitles'
import { StreamingData } from '@better-melon/shared/types'
import { useSubtitleStyles } from '@/lib/hooks/use-subtitle-styles'
import { hasChanged } from '@/lib/utils/utils'
import { useDelayStore } from '@/lib/stores/delay-store'

export default function useFullPlayground() {
  const animeId = 20661;
  const episodeNumber = 5;
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);

  const streamingData = generalData.streamingData
  const transcriptions = (transcriptionsQuery as {
    transcriptions: TranscriptionQuery[],
    activeTranscriptions: SubtitleTranscription[]
  }).transcriptions

  const wordsLookup = useMemo(() => {
    if (!words) return new Map() as WordsLookup;
    const lookup = new Map() as WordsLookup;
    console.log(`words`, words)
    words.forEach((wordsData) => lookup.set(wordsData.word, {
      word: wordsData.word,
      status: wordsData.status as Word['status']
    }));
    return lookup;
  }, [words]);

  const pitchLookup = useMemo(() => {
    if(pitchQueries.some(q => q.isLoading)) return new Map()
    const newLookup = new Map<string, NHKEntry>();
    
    pitchQueries.forEach(query => {
      if (query.data) {
        query.data.forEach(entry => {
          if (entry.word) {
            newLookup.set(entry.word, entry);
          }
        });
      }
    });

    return newLookup;
  }, [pitchQueries.map(q => q.data).join(',')]); // Stable dependency

  const transcriptionsLookup = useMemo(() => {
    const lookup = new Map<SubtitleTranscription, Map<string, SubtitleCue>>();

    transcriptions.forEach(transcription => {
      if(!transcription) return
      const cueMap = new Map<string, SubtitleCue>();
      transcription.cues.forEach(cue => {
        if(cue.transcription == 'english') {
          // Apply English delay when storing
          cueMap.set(
            getTranscriptionsLookupKey(cue.from, cue.to), 
            cue
          );
        } else {
          // Apply Japanese delay when storing
          cueMap.set(
            getTranscriptionsLookupKey(cue.from, cue.to), 
            cue
          );
        }
      });
      lookup.set(transcription.transcription, cueMap);
    });
    
    return lookup;
  }, [transcriptions]);
  
  useSetSubtitles({
    // @ts-ignore
    streamingData: generalData.streamingData,
    preferredFormat: settings.subtitle.preferredFormat || "srt",
    episodeNumber,
    cachedFiles: {
      japanese: null,
      english: null
    }
  });

  useSubtitleStyles();

  const streamingStore = useStreamingStore();
  const settingsStore = useSettingsStore();
  const transcriptionStore = useTranscriptionStore();
  const learningStore = useLearningStore();
  const setDelay = useDelayStore((state) => state.setDelay);
  
  const currentStreamingState = useStreamingStore.getState();
  const currentSettingsState = useSettingsStore.getState();
  const currentTranscriptionState = useTranscriptionStore.getState();
  const currentLearningState = useLearningStore.getState();

  // Update episode store
  useEffect(() => {
    const updates: Partial<{
      animeId: number;
      episodeNumber: number;
      streamingData: StreamingData;
      episodesLength: number;
    }> = {};
    
    if (hasChanged(animeId, currentStreamingState.animeId)) {
      updates.animeId = animeId;
      setDelay({
        english: 0,
        japanese: 0
      });
    }
    
    if (hasChanged(episodeNumber, currentStreamingState.episodeNumber)) {
      updates.episodeNumber = episodeNumber;
    }
    
    if (hasChanged(streamingData, currentStreamingState.streamingData)) {
      // @ts-ignore
      updates.streamingData = streamingData;
    }
    
    // Only update if there are actual changes
    if (Object.keys(updates).length > 0) {
      console.log('Batch updating episode store with:', Object.keys(updates));
      streamingStore.batchUpdate(updates);
    }
  }, [animeId, episodeNumber, streamingData]);

  // Update settings store
  useEffect(() => {
    if (hasChanged(settings, {
      generalSettings: currentSettingsState.general,
      playerSettings: currentSettingsState.player,
      subtitleSettings: currentSettingsState.subtitle,
      wordSettings: currentSettingsState.word,
    })) {
      if (settings) {
        console.log('Batch updating settings store with:', Object.keys(settings));
        settingsStore.batchUpdate({
          // @ts-ignore
          generalSettings: settings.general,
          // @ts-ignore
          playerSettings: settings.player,
          // @ts-ignore
          subtitleSettings: settings.subtitle,
          // @ts-ignore
          wordSettings: settings.word,
        });
      }
    }
  }, [settings]);

  // Update transcription store
  useEffect(() => {
    const updates: Partial<{
      transcriptions: any;
      transcriptionsLookup: any;
      transcriptionsStyles: any;
    }> = {};
    
    if (hasChanged(transcriptions, currentTranscriptionState.transcriptions)) {
      updates.transcriptions = transcriptions;
    }
    
    if (hasChanged(transcriptionsLookup, currentTranscriptionState.transcriptionsLookup)) {
      updates.transcriptionsLookup = transcriptionsLookup;
    }
    
    // Only update if there are actual changes
    if (Object.keys(updates).length > 0) {
      console.log('Batch updating transcription store with:', Object.keys(updates));
      transcriptionStore.batchUpdate(updates);
    }
  }, [transcriptions, transcriptionsLookup]);

  // Update learning store
  useEffect(() => {
    const updates: Partial<{
      pitchLookup: any;
      wordsLookup: any;
    }> = {};
    
    if (hasChanged(pitchLookup, currentLearningState.pitchLookup)) {
      updates.pitchLookup = pitchLookup;
    }
    
    if (hasChanged(wordsLookup, currentLearningState.wordsLookup)) {
      updates.wordsLookup = wordsLookup;
    }

    // Only update if there are actual changes
    if (Object.keys(updates).length > 0) {
      console.log('Batch updating learning store with:', Object.keys(updates));
      learningStore.batchUpdate(updates);
    }
  }, [pitchLookup, wordsLookup]);

  useEffect(() => {
    setTimeout(() => {
      streamingStore.setIsLoading(false)
      setHasInitialized(true)
    }, 1000);
  }, [])

  useEffect(() =>{ 
    console.log(`test streamingStore`, streamingStore )
    console.log(`test settingsStore`, settingsStore )
    console.log(`test transcriptionStore`, transcriptionStore )
    console.log(`test learningStore`, learningStore )
  }, [streamingStore, settingsStore, transcriptionStore, learningStore])


  return {
    wordsLookup,
    pitchLookup,
    transcriptionsLookup,
  }
}