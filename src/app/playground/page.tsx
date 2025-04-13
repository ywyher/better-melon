'use client'

import InfoCard from "@/components/info-card"
import { useInfoCardStore } from "@/lib/stores/info-card-store"
import { useEffect } from "react"

export default function Playground() {
  const { setSentance, setToken } = useInfoCardStore()

  useEffect(() =>{ 
    setToken({surface_form: "asd"})
    setSentance("test 2")
  }, [])

  return (
    
    <div className="relative flex flex-col gap-5 justify-center items-center h-screen w-screen">
      <InfoCard />
    </div>
  )
}