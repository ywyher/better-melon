import { getProfileHistory, getProfileUser, getProfileWords } from "@/app/user/[username]/actions";
import { getSession } from "@/lib/auth-client";
import { History, User } from "@/lib/db/schema";
import { calculateActivityHistoryLevel, padActivityHistory } from "@/lib/utils/history";
import { groupByDate, sortObject } from "@/lib/utils/utils";
import { ActivityHistoryEntry } from "@/types/history";
import { WordFilters } from "@/types/word";
import { createQueryKeys } from "@lukemorales/query-key-factory";

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
    search,
    page,
    limit
  }: { 
    username: User['name'];
    search?: string;
    page?: number;
    limit?: number
  }) => ({
    queryKey: ['history', username, search, page],
    queryFn: async () => {
      const { history, pagination } = await getProfileHistory({ 
        username,
        search,
        page,
        limit
      })

      return {
        history,
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
    queryKey: ['words', sortObject({ object: filters, output: 'string' })],
    queryFn: async () => {
      const { words, pagination } = await getProfileWords({ 
        username,
        filters
      })

      return {
        words,
        pagination
      }
    }
  }),
  activiyHistory: ({ username }: { username: User['name'] }) => ({
    queryKey: ['activity-history', username],
    queryFn: async () => {
      const { history } = await getProfileHistory({ username })

      const grouped = groupByDate<History>({ array: history, dateExtractor: (history) => history.createdAt })

      const entries: ActivityHistoryEntry[] = Object.entries(grouped).map(([date, entries]) => ({
        date,
        count: entries.length,
        level: calculateActivityHistoryLevel(entries.length),
        medias: entries
      }));

      const paddedEntries: ActivityHistoryEntry[] = padActivityHistory(entries)

      return {
        grouped,
        entries: paddedEntries
      }
    }
  }),
})