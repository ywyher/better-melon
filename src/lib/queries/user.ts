import { authClient, getSession } from "@/lib/auth-client";
import { User } from "@/lib/db/schema";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const user = createQueryKeys('user', {
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
    })
});