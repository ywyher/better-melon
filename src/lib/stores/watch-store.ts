import { create } from 'zustand';
import { AnimeEpisodeData } from '@/types/anime';
import { SettingsForEpisode } from '@/types/settings';
import { PitchLookup, Subtitle, TranscriptionQuery, TranscriptionsLookup, TranscriptionStyles, WordsLookup } from '@/app/watch/[id]/[ep]/types';
import { defaultGeneralSettings } from '@/lib/constants/settings';
import { defaultPlayerSettings } from '@/app/settings/player/constants';
import { defaultSubtitleSettings } from '@/app/settings/subtitle/_subtitle-settings/constants';
import { defaultWordSettings } from '@/app/settings/word/constants';
import { defaultSubtitleStyles } from '@/components/subtitle/styles/constants';

// Define the types for our store data
interface WatchDataState {
  // Episode data
  episodeData: AnimeEpisodeData | null;
  episodesLength: number;
  
  // Settings
  settings: SettingsForEpisode | null;
  
  // Transcriptions
  transcriptions: TranscriptionQuery[] | null;
  transcriptionsLookup: TranscriptionsLookup | null;

  styles: TranscriptionStyles | null;

  // Subtitles
  activeSubtitles: Subtitle | null;
  
  // Pitch accent
  pitchLookup: PitchLookup | null;
  
  // Words
  wordsLookup: WordsLookup | null;
  
  // Actions
  setEpisodeData: (data: WatchDataState['episodeData']) => void;
  setEpisodesLength: (length: WatchDataState['episodesLength']) => void;

  setSettings: (settings: WatchDataState['settings']) => void;

  setTranscriptions: (transcriptions: WatchDataState['transcriptions']) => void;
  setTranscriptionsLookup: (lookup: WatchDataState['transcriptionsLookup']) => void;
  setActiveSubtitles: (subtitles: WatchDataState['activeSubtitles']) => void;
  setStyles: (transcriptionsStyles: WatchDataState['styles']) => void;

  setPitchLookup: (lookup: WatchDataState['pitchLookup']) => void;
  setWordsLookup: (lookup: WatchDataState['wordsLookup']) => void;

  // Reset function for episode changes
  resetWatchData: () => void;
}

const initialState = {
  episodeData: null,
  episodesLength: 0,

  settings: {
    generalSettings: defaultGeneralSettings,
    playerSettings: defaultPlayerSettings,
    subtitleSettings: defaultSubtitleSettings,
    wordSettings: defaultWordSettings
  },

  transcriptions: null,
  transcriptionsLookup: null,
  styles: {
    all: {
      tokenStyles: {
        default: defaultSubtitleStyles.default,
        active: defaultSubtitleStyles.active,
      },
      containerStyles: {
        default: null,
        active: null
      }
    }
  },

  activeSubtitles: null,

  pitchLookup: null,
  wordsLookup: null,
};

export const useWatchDataStore = create<WatchDataState>((set, get) => ({
  ...initialState,
  
  // Actions
  setEpisodeData: (episodeData) => set({ episodeData }),
  setEpisodesLength: (episodesLength) => set({ episodesLength }),

  setSettings: (settings) => set({ settings }),
  setTranscriptions: (transcriptions) => set({ transcriptions }),
  setTranscriptionsLookup: (transcriptionsLookup) => set({ transcriptionsLookup }),
  setStyles: (styles) => set({ styles }),
  setActiveSubtitles: (activeSubtitles) => set({ activeSubtitles }),
  
  setPitchLookup: (pitchLookup) => set({ pitchLookup }),
  setWordsLookup: (wordsLookup) => set({ wordsLookup }),

  resetWatchData: () => set({
    ...initialState,
  }),
}));