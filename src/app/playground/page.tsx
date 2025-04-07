"use client"
import { useQuery } from "@tanstack/react-query"
import { parseSubtitleToJson } from "@/lib/fetch-subs"
import { srtJp } from "@/lib/constants"
import { useInfoCardStore } from "@/lib/stores/info-card-store"
import { SubtitleToken } from "@/types/subtitle"
import InfoCard from "@/components/info-card"

export default function Playground() {
  const setSentance = useInfoCardStore((state) => state.setSentance)
  const setToken = useInfoCardStore((state) => state.setToken)
  
  const { data, isLoading } = useQuery({
    queryKey: ['playground'],
    queryFn: async () => {
      return await parseSubtitleToJson({ source: srtJp, format: 'srt', script: 'japanese' })
    }
  })

  const handleClick = (sentance: string, token: SubtitleToken) => {
    if(!sentance || !token) return;
    setSentance(sentance)
    setToken(token)
  }

  if (isLoading || !data) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="relative flex justify-center items-center h-screen w-screen">
      <div className="max-w-xl p-6 rounded shadow">
        {data && data?.map((d, idx) => (
          <div key={idx}>
            {d.tokens && d.tokens.map((token, index) => (
              <span
                key={index}
                className="cursor-pointer text-lg underline decoration-dotted mx-0.5"
                onClick={() => {
                  handleClick(d.content, token)
                }}
              >
                {token.surface_form || token.word_id}
              </span>
            ))}
          </div>
        ))}
      </div>
      <InfoCard />
    </div>
  )
}