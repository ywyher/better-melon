import { AnilistList } from "@/types/anilist/list";
import { AnilistResponse } from "@better-melon/shared/types";
import { GET_ANIME_IN_LIST } from "@/lib/graphql/queries";
import { useMutation, useLazyQuery } from "@apollo/client";
import { Anime } from "@/types/anime";
import { ADD_ANIME_TO_LIST, DELETE_ANIME_FROM_LIST } from "@/lib/graphql/mutations";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { anilistOptionsSchema } from "@/components/add-to-list/types";

type UseAnimeInAnilistParams = {
  animeId: Anime['id'];
  accessToken?: string | null;
  accountId?: string;
  runOnMount?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function useAnimeInAnilist({
  animeId,
  accessToken,
  accountId,
  runOnMount = false,
  onSuccess,
  onError
}: UseAnimeInAnilistParams) {
  const [isLoading, setIsLoading] = useState(false);

  const [getAnimeInList, {
    data: animeInList,
    loading: queryLoading,
    refetch
  }] = useLazyQuery<AnilistResponse<"MediaList", AnilistList>>(
    GET_ANIME_IN_LIST,
    {
      context: {
        headers: {
          "Authorization": accessToken
        }
      },
      variables: {
        mediaId: Number(animeId),
        userId: Number(accountId),
        type: 'ANIME'
      },
      fetchPolicy: "no-cache"
    }
  );

  const [addAnimeToListMutation] = useMutation(ADD_ANIME_TO_LIST, {
    context: {
      headers: {
        "Authorization": accessToken
      }
    }
  });

  const [deleteAnimeFromListMutation] = useMutation(DELETE_ANIME_FROM_LIST, {
    context: {
      headers: {
        "Authorization": accessToken
      }
    }
  });

  useEffect(() => {
    if (!runOnMount || !accessToken || !accountId) return;
    getAnimeInList();
  }, [runOnMount, accessToken, accountId, getAnimeInList]);

  const handleSuccess = useCallback((message: string) => {
    toast.success(message);
    onSuccess?.();
  }, [onSuccess]);

  const handleError = useCallback((error: unknown, operation: string) => {
    const msg = error instanceof Error ? error.message : `Failed to ${operation}`;
    const errorMessage = `${operation}: ${msg}`;
    toast.error(errorMessage);
    onError?.(errorMessage);
  }, [onError]);

  const addAnimeToList = useCallback(async (data: z.infer<typeof anilistOptionsSchema>) => {
    if (!accessToken || !accountId) {
      throw new Error('Missing authentication credentials');
    }

    setIsLoading(true);
    
    try {
      const { errors } = await addAnimeToListMutation({
        variables: {
          mediaId: Number(animeId),
          status: data.status,
          progress: Number(data.episodeProgress),
          score: data.score,
          repeat: data.totalRewatches,
          notes: data.notes,
          startedAt: {
            year: data.startedAt?.getFullYear() || null,
            month: data.startedAt ? data.startedAt.getMonth() + 1 : null,
            day: data.startedAt?.getDate() || null,
          },
          completedAt: {
            year: data.finishedAt?.getFullYear() || null,
            month: data.finishedAt ? data.finishedAt.getMonth() + 1 : null,
            day: data.finishedAt?.getDate() || null,
          }
        }
      });

      if (errors?.[0]) {
        throw new Error(errors[0].message);
      }

      const successMessage = animeInList?.MediaList 
        ? "Updated anime in list" 
        : "Added anime to list";
      
      handleSuccess(successMessage);
      
      // Refetch the updated data
      refetch();
      
    } catch (error) {
      handleError(error, "add anime to list");
      throw error; // Re-throw for component-level handling if needed
    } finally {
      setIsLoading(false);
    }
  }, [
    animeId, 
    accessToken, 
    accountId, 
    addAnimeToListMutation, 
    animeInList?.MediaList,
    handleSuccess,
    handleError,
    refetch
  ]);

  const deleteAnimeFromList = useCallback(async () => {
    const entryId = animeInList?.MediaList?.media?.mediaListEntry?.id;
    
    if (!entryId) {
      throw new Error('Entry ID is undefined');
    }

    if (!accessToken) {
      throw new Error('Missing authentication credentials');
    }

    setIsLoading(true);
    
    try {
      const { errors } = await deleteAnimeFromListMutation({
        variables: { id: entryId }
      });

      if (errors?.[0]) {
        throw new Error(errors[0].message);
      }

      handleSuccess("Removed anime from list");
      
      refetch();
      
    } catch (error) {
      handleError(error, "remove anime from list");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [
    animeInList?.MediaList?.media?.mediaListEntry?.id,
    accessToken,
    deleteAnimeFromListMutation,
    handleSuccess,
    handleError,
    refetch
  ]);

  return {
    // Data
    animeInList,
    
    // Loading states
    isLoading: isLoading || queryLoading,
    isQueryLoading: queryLoading,
    
    // Actions
    getAnimeInList,
    addAnimeToList,
    deleteAnimeFromList,

    refetch
  };
}