import { getProfileHistory, getProfileUser, getProfileWords } from "@/app/user/[username]/actions";
import { getSession } from "@/lib/auth-client";
import { History, User, Word } from "@/lib/db/schema";
import { calculateActivityCalendarLevel, groupByDate, padActivityCalendar, sortObject } from "@/lib/utils/utils";
import { HistoryActivityEntry, HistoryFilters } from "@/types/history";
import { WordFilters, WordsActivityEntry } from "@/types/word";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { Activity } from "react-activity-calendar";

export const profileQueries = createQueryKeys('profile', {
  profile: ({ username }: { username: User['name'] }) => ({
    queryKey: ['profile', username],
    queryFn: async () => {
      const [{ data }, profileUser] = await Promise.all([
        getSession(),
        getProfileUser({ username })
      ])

      return {
        currentUser: data?.user as User,
        profileUser
      }
    }
  }),
  history: ({ 
    username,
    filters
  }: { 
    username: User['name'];
    filters: HistoryFilters
  }) => ({
    queryKey: ['history', sortObject({ object: filters })],
    queryFn: async () => {
      const [{ history, pagination }, { history: unfiltered }] = await Promise.all([
        getProfileHistory({ username, filters }),
        getProfileHistory({ username, filters: { page: 1, limit: Number.MAX_SAFE_INTEGER } }),
      ])

      const grouped = groupByDate<History>({ array: unfiltered, dateExtractor: (history) => history.updatedAt })
      
      const entries: Activity[] = Object.entries(grouped).map(([date, entries]) => ({
        date,
        count: entries.length,
        level: calculateActivityCalendarLevel(entries.length),
      }));

      const paddedEntries: Activity[] = padActivityCalendar(entries)

      return {
        history,
        activity: paddedEntries,
        pagination
      }
    }
  }),
  words: ({ 
    username,
    filters,
  }: { 
    username: User['name'];
    filters: WordFilters
  }) => ({
    queryKey: ['words', sortObject({ object: filters })],
    queryFn: async () => {
      const [{ words, pagination }, { words: unfiltered }] = await Promise.all([
        getProfileWords({ username, filters }),
        getProfileWords({ username, filters: { page: 1, limit: Number.MAX_SAFE_INTEGER } }),
      ])
      
      const grouped = groupByDate<Word>({ array: unfiltered, dateExtractor: (words) => words.updatedAt })
      
      const entries: Activity[] = Object.entries(grouped).map(([date, entries]) => ({
        date,
        count: entries.length,
        level: calculateActivityCalendarLevel(entries.length),
      }));

      const paddedEntries: Activity[] = padActivityCalendar(entries)

      return {
        words,
        activity: paddedEntries,
        pagination
      }
    }
  }),
  historyActivity: ({ username }: { username: User['name'] }) => ({
    queryKey: ['history-history', username],
    queryFn: async () => {
      const { history } = await getProfileHistory({
        username,
        filters: {
          page: 1,
          limit: Number.MAX_SAFE_INTEGER
        }
      })

      const grouped = groupByDate<History>({ array: history, dateExtractor: (history) => history.updatedAt })

      const entries: HistoryActivityEntry[] = Object.entries(grouped).map(([date, entries]) => ({
        date,
        count: entries.length,
        level: calculateActivityCalendarLevel(entries.length),
        animes: entries
      }));

      const paddedEntries: Activity[] = padActivityCalendar(entries)

      return {
        grouped,
        entries: paddedEntries as HistoryActivityEntry[]
      }
    }
  }),
  wordsActivity: ({ username }: { username: User['name'] }) => ({
    queryKey: ['words-activity', username],
    queryFn: async () => {
      const { words } = await getProfileWords({
        username,
        filters: {
          page: 1,
          limit: Number.MAX_SAFE_INTEGER
        }
      })

      const grouped = groupByDate<Word>({ array: words, dateExtractor: (word) => word.updatedAt })

      const entries: WordsActivityEntry[] = Object.entries(grouped).map(([date, entries]) => ({
        date,
        count: entries.length,
        level: calculateActivityCalendarLevel(entries.length),
        words: entries
      }));

      const paddedEntries: Activity[] = padActivityCalendar(entries)

      return {
        grouped,
        entries: paddedEntries as WordsActivityEntry[]
      }
    }
  }),
})