import useIsTranscriptionsCached from "@/lib/hooks/use-is-transcriptions-cached"

export default function IsTranscriptionsCachedPlayground() {
  const { cachedFilesNames, isCached, isLoading } = useIsTranscriptionsCached({
    animeId: "97986",
    episodeNumber: 9
  })

  if(isLoading) return <>Loading</>

  return (
    <div className="flex flex-col gap-3">
      <div>{isCached ? "true" : "false"}</div>
      <div>{cachedFilesNames.english}</div>
      <div>{cachedFilesNames.japanese}</div>
    </div>
  )
}