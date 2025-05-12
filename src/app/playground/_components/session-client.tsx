'use client'

import { useSession } from "@/lib/queries/user"
import { useEffect, useRef } from "react"

export default function SessionCleintPlayground() {
  const startTimeRef = useRef(performance.now())
  const { data: session, status } = useSession()

  useEffect(() => {
    if(status == 'success') {
      const end = performance.now()
      console.info(`Session ready in ${(end - startTimeRef.current).toFixed(2)}ms`)
    }
  }, [status])

  return (
    <></>
  )
}