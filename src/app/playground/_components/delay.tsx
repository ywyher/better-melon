"use client"

import DelayController from "@/app/watch/[id]/[ep]/_components/settings/delay-controller";
import { useDelayStore } from "@/lib/stores/delay-store";
import { useEffect } from "react";

export default function DelayPlayground() {
  const delay = useDelayStore((state) => state.delay); 

  useEffect(() => {
    console.log(delay)
  }, [delay])

  return (
    <>
      <DelayController />
    </>
  )
}