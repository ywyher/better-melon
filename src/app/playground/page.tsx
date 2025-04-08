'use client'

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function Playground() {
  const onClick = async () => {
    const response = await authClient.signIn.oauth2({
      providerId: "anilist",
      callbackURL: "/"
    });

    console.log(response)
  }

  return (
    <div className="relative flex flex-col gap-5 justify-center items-center h-screen w-screen">
      <Button onClick={() => onClick()}>
        Better auth
      </Button>
    </div>
  )
}