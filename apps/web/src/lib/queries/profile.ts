import { getProfileHistory, getProfileUser } from "@/app/user/[username]/actions";
import { getSession } from "@/lib/auth-client";
import { History, User } from "@/lib/db/schema";
import { calculateActivityHistoryLevel, padActivityHistory } from "@/lib/utils/history";
import { groupByDate } from "@/lib/utils/utils";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const profileQueries = createQueryKeys('anki', {
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
  activiyHistory: ({ username }: { username: User['name'] }) => ({
    queryKey: ['profile', username],
    queryFn: async () => {
      const { history } = await getProfileHistory({ username })

      const grouped = groupByDate<History>({ array: history, dateExtractor: (history) => history.createdAt })

      const entries = Object.entries(grouped).map(([date, entries]) => ({
        date,
        count: entries.length,
        level: calculateActivityHistoryLevel(entries.length),
        data: entries
      }));

      const paddedEntries = padActivityHistory(entries)

      return {
        grouped,
        entries: paddedEntries
      }
    }
  }),
})