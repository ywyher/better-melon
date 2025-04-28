import AnimeListProviderCard from "@/app/settings/anime-lists/_components/anime-list-provider-card";
import { animeListStatuses } from "@/components/add-to-list/constants";
import { anilistOptionsSchema } from "@/components/add-to-list/types";
import { CalendarInput } from "@/components/form/calendar-input";
import { FormField } from "@/components/form/form-field";
import { NumberInput } from "@/components/form/number-input";
import { SelectInput } from "@/components/form/select-input";
import { TextareaInput } from "@/components/form/textarea-input";
import LoadingButton from "@/components/loading-button";
import { Form } from "@/components/ui/form";
import { useIsSmall } from "@/hooks/use-media-query";
import { getAccessToken } from "@/lib/db/queries";
import { Anime } from "@/types/anime";
import { AnimeListProivder, AnimeListProivders } from "@/types/anime-list";
import { gql, useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { date } from "drizzle-orm/pg-core";
import { useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const ADD_ANIME = gql`
  mutation SaveMediaListEntry(
      $mediaId: Int,
      $status: MediaListStatus,
      $progress: Int,
      $startedAt: FuzzyDateInput,
      $completedAt: FuzzyDateInput,
      $score: Float,
      $repeat: Int,
      $notes: String
  ) {
  SaveMediaListEntry(
      mediaId: $mediaId,
      status: $status,
      progress: $progress,
      startedAt: $startedAt,
      completedAt: $completedAt,
      score: $score,
      repeat: $repeat,
      notes: $notes
  ) {
      status
      progress
      startedAt {
        year
        month
        day
      }
      completedAt {
        year
        month
        day
      }
      score
      repeat
      notes
    }
  }
`

type AnilistListOptionsProps = {
  provider: AnimeListProivder;
  animeId: Anime['id']
  accountId?: string
}

export default function AnilistListOptions({ 
  animeId,
  provider,
  accountId
}: AnilistListOptionsProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const isSmall = useIsSmall()
  const [addAnimeToList, { loading }] = useMutation(ADD_ANIME, {
    onError: (error) => {
      console.log(`error`)
      console.log(error)
    }
  });

  const form = useForm<z.infer<typeof anilistOptionsSchema>>({
    resolver: zodResolver(anilistOptionsSchema)
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
      startedAt: data.startDate ? {
        year: data.startDate.getFullYear(),
        month: data.startDate.getMonth() + 1,
        day: data.startDate.getDate(),
      }: {
        day: null,
        month: null,
        year: null
      },
      completedAt: data.endDate ? {
        year: data.endDate.getFullYear(),
        month: data.endDate.getMonth() + 1,
        day: data.endDate.getDate(),
      }: {
        day: null,
        month: null,
        year: null
      },
    };

    console.log(mutationVariables)

    try {

      if(!accountId) throw new Error("Account id is not")

      const accessToken = await getAccessToken({ accountId })

      if(!accessToken) throw new Error("Access token id not found!")

      const { errors } = await addAnimeToList({ 
        context: {
          headers: {
            "Authorization": accessToken
          }
        },
        variables: mutationVariables
      });
      
      if(errors) {
        console.log(errors)
        throw new Error(errors[0].message)
      }


      setIsLoading(false);
      toast('Sucess', {
        description: `Successfully added anime to your ${provider.name} list!`,
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

  return (
    <>
      {(accountId) ? (
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
                  <NumberInput />
                </FormField>
                <FormField
                  form={form}
                  name="episodeProgress"
                  label="Episode Progress"
                >
                  <NumberInput />
                </FormField>
              </div>
              <div className="flex flex-row justify-between gap-5">
                <FormField
                  form={form}
                  name="startDate"
                  label="Start Date"
                >
                  <CalendarInput />
                </FormField>
                <FormField
                  form={form}
                  name="endDate"
                  label="End Date"
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