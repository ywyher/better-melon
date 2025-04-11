'use client'

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function Playground() {
  const signIn = async () => {
    const { data, error } = await authClient.signIn.email({
      email: 'yassienwyh0@gmail.com',
      password: "Bywyh2012008@",
    });

    if(error) {
      await authClient.signUp.email({
        email: 'yassienwyh0@gmail.com',
        password: 'Bywyh2012008@',
        name: "ywyh",
      });

      await authClient.signIn.email({
        email: 'yassienwyh0@gmail.com',
        password: "Bywyh2012008@",
    });
    }
  }

  const signInAnilist = async () => {
    const result = await authClient.signIn.oauth2({
      providerId: "anilist",
      callbackURL: "/playground"
    });

    console.log(`#######################3`)
    console.log(result)
  }

  const logout = async () => {
    const response = await authClient.signOut();

    console.log(`#######################3`)
    console.log(response)
  }

  const getUser = async () => {
    const response = await authClient.getSession();

    console.log(`#######################3`)
    console.log(response)
  }

  const getLinked = async () => {
    const accounts = await authClient.listAccounts();

    console.log(`###########################3`)
    console.log(accounts.data)
  }

  const onClick = async () => {
    const response = await authClient.oauth2.link({
      providerId: "anilist",
      callbackURL: "/playground",
      fetchOptions: {
        params: {
          email: "yasssienwyh0@gmail.com",
        }
      }
    });

    console.log(`#######################3`)
    console.log(response)
  }

  return (
    <div className="relative flex flex-col gap-5 justify-center items-center h-screen w-screen">
      <Button onClick={() => getUser()}>
        get user
      </Button>
      <Button onClick={() => signIn()}>
        Signin
      </Button>
      <Button onClick={() => signInAnilist()}>
        Signin anilist
      </Button>
      <Button onClick={() => logout()}>
        Logout
      </Button>
      <Button onClick={() => getLinked()}>
        Linked accounts
      </Button>
      <Button onClick={() => onClick()}>
        Better auth
      </Button>
    </div>
  )
}