'use client'

import { getSessionServer } from "@/app/playground/actions"
import { loginSchema } from "@/components/auth/login"
import InfoCard from "@/components/info-card"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { authClient } from "@/lib/auth-client"
import { useInfoCardStore } from "@/lib/stores/info-card-store"
import { useEffect } from "react"

export default function Playground() {

  const onSignIn = async () => {
    const { data, error } = await authClient.signIn.anonymous()

    if(error) {
      console.error(error.message)
    }

    console.log(data)
  }

  const onGetSessionClient = async () => {
    const session = await authClient.getSession()
    console.log(session)
  }
  const onGetSessionServer = async () => {
    const session = await getSessionServer()
    console.log(session)
  }

  return (
    
    <div className="relative flex flex-col gap-5 justify-center items-center h-screen w-screen">
      <Button
        onClick={() => {
          onGetSessionClient()
        }}
      >
        server
      </Button>
      <Button
        onClick={() => {
          onGetSessionServer()
        }}
      >
        client
      </Button>
      <Button
        onClick={() => {
          onSignIn()
        }}
      >
        Anon
      </Button>
    </div>
  )
}