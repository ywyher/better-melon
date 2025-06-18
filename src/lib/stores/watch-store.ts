import { create } from 'zustand';
import { AnimeEpisodeData } from '@/types/anime';
import { SettingsForEpisode } from '@/types/settings';
import { PitchLookup, Subtitle, TranscriptionQuery, TranscriptionsLookup, TranscriptionStyles, WordsLookup } from '@/app/watch/[id]/[ep]/types';
import { defaultGeneralSettings } from '@/lib/constants/settings';
import { defaultPlayerSettings } from '@/app/settings/player/constants';
import { defaultSubtitleSettings } from '@/app/settings/subtitle/_subtitle-settings/constants';
import { defaultWordSettings } from '@/app/settings/word/constants';
import { defaultSubtitleStyles } from '@/components/subtitle/styles/constants';
import { getContainerStyles, getTokenStyles } from '@/lib/utils/styles';

// Define the types for our store data
interface WatchDataState {
  // Essentials
  animeId: number;
  episodeNumber: number;

  // Episode data
  episodeData: AnimeEpisodeData | null;
  episodesLength: number;
  
  // Settings
  settings: SettingsForEpisode;
  
  // Transcriptions
  transcriptions: TranscriptionQuery[] | null;
  transcriptionsLookup: TranscriptionsLookup;

  styles: TranscriptionStyles;

  // Subtitles
  activeSubtitles: Subtitle | null;
  
  // Pitch accent
  pitchLookup: PitchLookup;
  
  // Words
  wordsLookup: WordsLookup;

  // Stats
  isLoading: boolean;
  loadingDuration: number;
  
  // Actions
  setAnimeId: (animeId: WatchDataState['animeId']) => void;
  setEpisodeNumber: (episodeNumber: WatchDataState['episodeNumber']) => void;

  setEpisodeData: (data: WatchDataState['episodeData']) => void;
  setEpisodesLength: (length: WatchDataState['episodesLength']) => void;

  setSettings: (settings: WatchDataState['settings']) => void;

  setTranscriptions: (transcriptions: WatchDataState['transcriptions']) => void;
  setTranscriptionsLookup: (lookup: WatchDataState['transcriptionsLookup']) => void;
  setActiveSubtitles: (subtitles: WatchDataState['activeSubtitles']) => void;
  setStyles: (transcriptionsStyles: WatchDataState['styles']) => void;

  setPitchLookup: (lookup: WatchDataState['pitchLookup']) => void;
  setWordsLookup: (lookup: WatchDataState['wordsLookup']) => void;

  setIsLoading: (isLoading: WatchDataState['isLoading']) => void;
  setLoadingDuration: (duration: WatchDataState['loadingDuration']) => void;

  // Reset function for episode changes
  resetWatchData: () => void;
}

const initialState = {
  animeId: 0,
  episodeNumber: 0,

  episodeData: null,
  episodesLength: 0,

  settings: {
    generalSettings: defaultGeneralSettings,
    playerSettings: defaultPlayerSettings,
    subtitleSettings: defaultSubtitleSettings,
    wordSettings: defaultWordSettings
  },

  transcriptions: null,
  transcriptionsLookup: new Map(),
  styles: {
    all: {
      tokenStyles: getTokenStyles(false, {
        active: defaultSubtitleStyles.active,
        default: defaultSubtitleStyles.default
      }),
      containerStyle: getContainerStyles({
        active: defaultSubtitleStyles.active,
        default: defaultSubtitleStyles.default
      })
    }
  },

  activeSubtitles: null,

  pitchLookup: new Map(),
  wordsLookup: new Map(),
  
  isLoading: true,
  loadingDuration: 0
};

export const useWatchDataStore = create<WatchDataState>((set, get) => ({
  ...initialState,

  // Actions
  setAnimeId: (animeId) => set({ animeId }),
  setEpisodeNumber: (episodeNumber) => set({ episodeNumber }),
  
  setEpisodeData: (episodeData) => set({ episodeData }),
  setEpisodesLength: (episodesLength) => set({ episodesLength }),

  setSettings: (settings) => set({ settings }),
  setTranscriptions: (transcriptions) => set({ transcriptions }),
  setTranscriptionsLookup: (transcriptionsLookup) => set({ transcriptionsLookup }),
  setStyles: (styles) => set({ styles }),
  setActiveSubtitles: (activeSubtitles) => set({ activeSubtitles }),
  
  setPitchLookup: (pitchLookup) => set({ pitchLookup }),
  setWordsLookup: (wordsLookup) => set({ wordsLookup }),
  
  setIsLoading: (isLoading) => set({ isLoading }),
  setLoadingDuration: (loadingDuration) => set({ loadingDuration }),

  resetWatchData: () => set({
    ...initialState,
  }),
}));