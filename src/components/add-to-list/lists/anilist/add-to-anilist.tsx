import AnimeListProviderCard from "@/app/settings/anime-lists/_components/anime-list-provider-card";
import { animeListStatuses } from "@/components/add-to-list/constants";
import { AddToAnilistSkeleton } from "@/components/add-to-list/lists/anilist/add-to-anilist-skeleton";
import { AnilistGetListQuery, anilistOptionsSchema } from "@/components/add-to-list/types";
import { CalendarInput } from "@/components/form/calendar-input";
import { FormField } from "@/components/form/form-field";
import { NumberInput } from "@/components/form/number-input";
import { SelectInput } from "@/components/form/select-input";
import { TextareaInput } from "@/components/form/textarea-input";
import LoadingButton from "@/components/loading-button";
import { Form } from "@/components/ui/form";
import { useIsSmall } from "@/lib/hooks/use-media-query";
import { getAccessToken } from "@/lib/db/queries";
import { Anime } from "@/types/anime";
import { AnimeListProivder } from "@/types/anime-list";
import { gql, useMutation, useQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { GET_ANIME_FROM_LIST } from "@/lib/graphql/queries";
import { ADD_ANIME_TO_LIST } from "@/lib/graphql/mutations";


type AnilistListOptionsProps = {
  provider: AnimeListProivder;
  animeId: Anime['id']
  accountId?: string
  setOpen: Dispatch<SetStateAction<boolean>>
}

const convertFuzzyDateToDate = (fuzzyDateObj: { 
  year: number | null, 
  month: number | null, 
  day: number | null 
} | undefined) => {
  if (!fuzzyDateObj) {
    return null;
  }
  
  const { day, month, year } = fuzzyDateObj;
  
  if (day === null && month === null && year === null) {
    return null;
  }
  
  const safeYear = year !== null ? year : new Date().getFullYear();
  const safeMonth = month !== null ? month - 1 : 0; // JavaScript months are 0-indexed
  const safeDay = day !== null ? day : 1;
  
  return new Date(safeYear, safeMonth, safeDay);
}

export default function AnilistListOptions({ 
  animeId,
  provider,
  accountId,
  setOpen
}: AnilistListOptionsProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const isSmall = useIsSmall()
  const { data, loading, refetch } = useQuery<AnilistGetListQuery, {mediaId: number, userId: number, type: "ANIME"}>(GET_ANIME_FROM_LIST, {
    variables: {
      mediaId: Number(animeId),
      userId: Number(accountId),
      type: 'ANIME'
    },
  })
  const [addAnimeToList] = useMutation(ADD_ANIME_TO_LIST, {
    onCompleted: () => {
      refetch();
      
      setIsLoading(false);
      toast('Success', {
        description: `Successfully added anime to your ${provider.name} list!`,
      });
      setOpen(false)
    },
    onError: (error) => {
      setIsLoading(false)
      toast.error("Failure", {
        description: error.message || ""
      })
    }
  });

  const form = useForm<z.infer<typeof anilistOptionsSchema>>({
    resolver: zodResolver(anilistOptionsSchema),
  })

  const onSubmit = async (data: z.infer<typeof anilistOptionsSchema>) => {
    setIsLoading(true)    

    const mutationVariables = {
      mediaId: Number(animeId),
      status: data.status || "CURRENT",
      progress: data.episodeProgress || 0,
      score: data.score || 0,
      repeat: data.totalRewatches || 0,
      notes: data.notes || null,
      startedAt: data.startedAt ? {
        year: data.startedAt.getFullYear(),
        month: data.startedAt.getMonth() + 1,
        day: data.startedAt.getDate(),
      }: {
        day: null,
        month: null,
        year: null
      },
      completedAt: data.finishedAt ? {
        year: data.finishedAt.getFullYear(),
        month: data.finishedAt.getMonth() + 1,
        day: data.finishedAt.getDate(),
      }: {
        day: null,
        month: null,
        year: null
      },
    };

    try {

      if(!accountId) throw new Error("Account id is not")

      const accessToken = await getAccessToken({ accountId })

      if(!accessToken) throw new Error("Access token id not found!")

      await addAnimeToList({ 
        context: {
          headers: {
            "Authorization": accessToken
          }
        },
        variables: mutationVariables
      });
    } catch (err) {
      setIsLoading(false)
      console.error("Error submitting form:", err);
    }
  }

  const onError = (errors: FieldErrors<z.infer<typeof anilistOptionsSchema>>) => {
      const position = isSmall ? "top-center" : "bottom-right"
      const firstError = Object.values(errors)[0];

      if (firstError?.message) {
        toast.error(firstError.message, { position });
      }
  }

  useEffect(() => {
    if(data?.MediaList) {
      const formValues = {
        startedAt: convertFuzzyDateToDate(data?.MediaList?.startedAt),
        finishedAt: convertFuzzyDateToDate(data?.MediaList?.completedAt),
        score: data?.MediaList?.score || 0,
        notes: data?.MediaList?.notes || null,
        status: data?.MediaList?.status || null,
        totalRewatches: data?.MediaList?.repeat || 0,
        episodeProgress: data?.MediaList?.progress || 0
      };
      
      const timer = setTimeout(() => {
        form.reset(formValues);
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [data, form]);

  useEffect(() => { 
    console.log({
      data, 
      loading
    })
  }, [data, loading])

  return (
    <>
      {(accountId) ? (
        <>
          {(!loading) ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit, onError)}
                className="flex flex-col gap-3"
              >
                <div className="flex flex-col gap-5">
                  <div className="flex flex-row justify-between gap-5">
                    <FormField
                      form={form}
                      name="status"
                      label="Status"
                    >
                      <SelectInput
                        options={animeListStatuses}
                      /> 
                    </FormField>
                    <FormField
                      form={form}
                      name="score"
                      label="Score"
                    >
                      <NumberInput max={10} />
                    </FormField>
                    <FormField
                      form={form}
                      name="episodeProgress"
                      label="Episode Progress"
                    >
                      <NumberInput 
                        max={data?.MediaList.media.episodes}
                      />
                    </FormField>
                  </div>
                  <div className="flex flex-row justify-between gap-5">
                    <FormField
                      form={form}
                      name="startedAt"
                      label="Start Date"
                    >
                      <CalendarInput />
                    </FormField>
                    <FormField
                      form={form}
                      name="finishedAt"
                      label="Finished At"
                    >
                      <CalendarInput />
                    </FormField>
                    <FormField
                      form={form}
                      name="totalRewatches"
                      label="Total Rewatches"
                    >
                      <NumberInput />
                    </FormField>
                  </div>
                  <FormField
                    form={form}
                    name="notes"
                    label="Notes"
                  >
                    <TextareaInput />
                  </FormField>
                </div>
                <LoadingButton isLoading={isLoading}>
                  Add to {provider.name}
                </LoadingButton>
              </form>
            </Form>
          ): (
            <AddToAnilistSkeleton />
          )}
        </>
      ): (
        <AnimeListProviderCard
          isConnected={false}
          provider={provider}
          isAuthenticated={true}
          callbackURL={`/info/${animeId}?addToList=true`}
        />
      )}
    </>
  )
}