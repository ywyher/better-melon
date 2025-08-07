import LoadingButton from "@/components/loading-button";
import useAnimeInAnilist from "@/lib/hooks/use-anime-in-anilist";
import AnimeListProviderCard from "@/app/settings/anime-lists/_components/anime-list-provider-card";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Anime } from "@/types/anime";
import { toast } from "sonner";
import { FormField } from "@/components/form/form-field";
import { useIsSmall } from "@/lib/hooks/use-media-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { NumberInput } from "@/components/form/number-input";
import { SelectInput } from "@/components/form/select-input";
import { userQueries } from "@/lib/queries/user";
import { CalendarInput } from "@/components/form/calendar-input";
import { TextareaInput } from "@/components/form/textarea-input";
import { AnimeListProivder } from "@/types/anime-list";
import { animeListStatuses } from "@/components/add-to-list/constants";
import { AddToAnilistSkeleton } from "@/components/add-to-list/lists/anilist/add-to-anilist-skeleton";
import { anilistOptionsSchema } from "@/components/add-to-list/types";
import { FieldErrors, useForm } from "react-hook-form";
import { convertFuzzyDateToDate } from "@/lib/utils/utils";
import { Dispatch, SetStateAction, useEffect } from "react";

type AnilistListOptionsProps = {
  animeId: Anime['id'];
  setOpen: Dispatch<SetStateAction<boolean>>;
  provider: AnimeListProivder
  accessToken: string;
  accountId: string
}

export default function AddToAnilist({ 
  animeId,
  setOpen,
  provider,
  accessToken,
  accountId
}: AnilistListOptionsProps) {
  const isSmall = useIsSmall();

  const { 
    animeInList,
    isLoading,
    isQueryLoading,
    addAnimeToList,
    deleteAnimeFromList,
  } = useAnimeInAnilist({
    animeId,
    accessToken: accessToken,
    accountId: accountId,
    runOnMount: true,
    onSuccess: () => setOpen(false),
  });

  const form = useForm<z.infer<typeof anilistOptionsSchema>>({
    resolver: zodResolver(anilistOptionsSchema),
  });

  const onError = (errors: FieldErrors<z.infer<typeof anilistOptionsSchema>>) => {
    const position = isSmall ? "top-center" : "bottom-right";
    const firstError = Object.values(errors)[0];

    if (firstError?.message) {
      toast.error(firstError.message, { position });
    }
  };

  useEffect(() => {
    if (animeInList?.MediaList) {
      const formValues = {
        startedAt: convertFuzzyDateToDate(animeInList.MediaList.startedAt),
        finishedAt: convertFuzzyDateToDate(animeInList.MediaList.completedAt),
        score: animeInList.MediaList.score || 0,
        notes: animeInList.MediaList.notes || null,
        status: animeInList.MediaList.status || null,
        totalRewatches: animeInList.MediaList.repeat || 0,
        episodeProgress: animeInList.MediaList.progress || 0
      };
      
      // Reset form with a timeout to ensure it happens after render
      const timer = setTimeout(() => {
        form.reset(formValues);
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [animeInList, form]);

  if (!accessToken || !accountId) {
    return (
      <AnimeListProviderCard
        isConnected={false}
        provider={provider}
        isAuthenticated={true}
        callbackURL={`/info/${animeId}?addToList=true`}
      />
    );
  }

  if(isQueryLoading) return <AddToAnilistSkeleton />

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(addAnimeToList, onError)}
        className="flex flex-col gap-3"
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-row justify-between gap-5">
            <FormField form={form} name="status" label="Status">
              <SelectInput options={animeListStatuses} /> 
            </FormField>
            <FormField form={form} name="score" label="Score">
              <NumberInput max={10} />
            </FormField>
            <FormField form={form} name="episodeProgress" label="Episode Progress">
              <NumberInput 
                max={animeInList?.MediaList?.media?.episodes}
              />
            </FormField>
          </div>
          <div className="flex flex-row justify-between gap-5">
            <FormField form={form} name="startedAt" label="Start Date">
              <CalendarInput />
            </FormField>
            <FormField form={form} name="finishedAt" label="Finished At">
            <CalendarInput />
            </FormField>
            <FormField form={form} name="totalRewatches" label="Total Rewatches">
              <NumberInput />
            </FormField>
          </div>
          <FormField form={form} name="notes" label="Notes">
            <TextareaInput />
          </FormField>
        </div>
        
        <div className="flex flex-row gap-2 justify-end">
          {animeInList?.MediaList && (
            <LoadingButton 
              type="button" 
              variant="destructive" 
              className="w-fit" 
              isLoading={isLoading}
              onClick={deleteAnimeFromList}
            >
              Delete
            </LoadingButton>
          )}
          <LoadingButton type="submit" className="w-fit" isLoading={isLoading}>
            {animeInList?.MediaList ? 'Update' : 'Add to'} {provider.name}
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
}