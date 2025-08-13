import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { profileQueries } from "@/lib/queries/profile";
import { parseAsInteger, useQueryState } from "nuqs";
import { useParams } from "next/navigation";
import { useMemo } from "react";

export default function ProfileWords() {
  const params = useParams()
  const username = String(params.username)
  const [query] = useQueryState('query')
  const [page] = useQueryState('page', parseAsInteger.withDefault(1))

  const { data, isLoading } = useQuery({
    ...profileQueries.words({
      username, 
      search: query ?? undefined,
      page,
      limit: 20
    })
  })

  const words = useMemo(() => {
    if(!data) return []
    return data.words
  }, [data])

  const pagination = useMemo(() => {
    if(!data) return null
    return data.pagination
  }, [data])

  if(isLoading) return <>Loading...</>

  return (
    <Card className="w-full bg-secondary">
      <CardHeader>
        <CardTitle className="text-2xl flex-1">Words</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent>
        {words && words.map(w => (
          <>{w.word}</>
        ))}
      </CardContent>
    </Card>
  )
}