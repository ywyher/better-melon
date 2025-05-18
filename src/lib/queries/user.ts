import { authClient, getSession } from "@/lib/auth-client";
import { listAccoutns as listAccoutnsActions } from "@/lib/db/queries";
import { User } from "@/lib/db/schema";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { useQuery } from "@tanstack/react-query";

export const userQueries = createQueryKeys('user', {
    session: () => ({
        queryKey: ['session'],
        queryFn: async () => {
          const data = await getSession()
          return data.data?.user as User || null
        }
    }),
    listAccounts: () => ({
        queryKey: ['session', 'accounts-list'],
        queryFn: async () =>{ 
          const { data } = await authClient.listAccounts()
          return data;
        }
    }),
    listAccountsFullData: ({ userId }: { userId: User['id'] }) => ({
      queryKey: ['session', 'account-list-w-access-token'],
      queryFn: async () => {
        return await listAccoutnsActions({ userId: userId })
      }
    })
});

export function useSession() {
    return useQuery({
        ...userQueries.session(),
    })
}