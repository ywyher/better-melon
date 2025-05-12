import { getSession } from "@/lib/db/queries"

export default async function SessionActionPlayground() {
  const user = await getSession()

  return (
    <></>
  )
}