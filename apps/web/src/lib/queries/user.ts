import { authClient, getSession } from "@/lib/auth-client";
import { getAccountInfo, getHistoryByUsername, getUserByUsername } from "@/lib/db/queries";
import { User } from "@/lib/db/schema";
import { AuthProvider } from "@/types";
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
      queryKey: ['accounts-list'],
      queryFn: async () =>{ 
        const { data } = await authClient.listAccounts()
        return data;
      }
    }),
    accessToken: ({
      provider
    }: {
      provider: AuthProvider
    }) => ({
      queryKey: ['access-token', provider],
      queryFn: async () => { 
        try {
          const { data, error } = await authClient.getAccessToken({
            providerId: provider
          })

          if(error) throw new Error(error.message)

          return {
            accessToken: data.accessToken,
            accessTokenExpiresAt: data.accessTokenExpiresAt,
            scopes: data.scopes,
            idToken: data.idToken
          };
        } catch (error) {
          const msg = error instanceof Error ? error.message : `Failed to get ${provider} access token`
          throw new Error(msg)
        }
      }
    }),
    accountInfo: ({
      provider
    }: {
      provider: AuthProvider
    }) => ({
      queryKey: ['account-info', provider],
      queryFn: async () => {
        try {
          const { info, userId, error } = await getAccountInfo({ provider })
          if(error) throw new Error(error)
          return {
            error: null,
            info,
            userId
          }
        } catch (error) {
          const msg = error instanceof Error ? error.message : "Failed to get account info"
          return {
            error: msg,
            info: null,
            userId: null
          }
        }
      }
    })
});

export function useSession() {
  return useQuery({
    ...userQueries.session(),
  })
}