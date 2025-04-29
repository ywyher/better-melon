import PlaygroundContainer from "@/app/playground/_components/query-times";
import SelectInputValue from "@/app/playground/_components/select-input-value";

export default async function Playground() {
  // const animeId = '21234';
  // const episodeNumber = 8;
  
  // const queryClient = new QueryClient()

  // await queryClient.prefetchQuery({
  //   queryKey: ['initialAnimeData', animeId],
  //   queryFn: () => getCompleteData(animeId, episodeNumber),
  //   staleTime: 60 * 1000 * 5
  // })

  return (
    // Neat! Serialization is now as easy as passing props.
    // HydrationBoundary is a Client Component, so hydration will happen there.
    // <HydrationBoundary state={dehydrate(queryClient)}>
      <SelectInputValue />
    // </HydrationBoundary>
  );
}