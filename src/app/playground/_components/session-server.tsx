import { getSession } from "@/lib/auth-client"

export default async function SessionServerPlayground() {
  const start = performance.now()
  const user = await getSession()
  const end = performance.now()
  console.info(`session took: ${(end - start).toFixed(2)}ms`)

  return (
    <></>
  )
}