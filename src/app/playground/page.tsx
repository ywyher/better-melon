"use client"

import { getSessionServer, loginOnServer } from "@/app/playground/actions"
import LoadingButton from "@/components/loading-button"
import { authClient, getSession } from "@/lib/auth-client"
import { User } from "@/lib/db/schema"
import { userQueries, useSession } from "@/lib/queries/user"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function Playground() {
    const [isLoading, setIsLoading] = useState(false)
    const queryClient = useQueryClient()

    const { data, isLoading: isSessionLoading } = useSession()

    useEffect(() => {
        console.log(data)
    }, [data])

    const logout = async () => {
        setIsLoading(true)
        const { error, data } = await authClient.signOut()

        if(error) {
            toast.error(error.message)
            console.log(error)
            setIsLoading(false)
            return;
        }

        toast.message("Logged out")
        queryClient.invalidateQueries({ queryKey: userQueries.session._def })
        setIsLoading(false)
        console.log(data)
    }

    const login = async () => {
        setIsLoading(true)
        // const { error, data } = await authClient.signIn.anonymous()
        const { error, data } = await authClient.signIn.email({
            email: 'yassienwyh0@gmail.com',
            password: 'Eywyh2001@'
        })

        if(error) {
            toast.error(error.message)
            console.log(error)
            setIsLoading(false)
            return;
        }

        toast.message("logged in")
        queryClient.invalidateQueries({ queryKey: userQueries.session._def })
        setIsLoading(false)
        console.log(data)
    }

    const session = async () => {
        setIsLoading(true)
        const { error, data } = await authClient.getSession()

        if(error) {
            toast.error(error.message)
            console.log(error)
            setIsLoading(false)
            return;
        }

        toast.message("Get Session")
        queryClient.invalidateQueries({ queryKey: userQueries.session._def })
        setIsLoading(false)
        console.log(data)
    }

    const loginServer = async () => {
        setIsLoading(true)
        const { message, error } = await loginOnServer()

        if(error) {
            toast.error(error)
            console.log(error)
            setIsLoading(false)
            return;
        }

        toast.message(message)
        queryClient.invalidateQueries({ queryKey: userQueries.session._def })
        setIsLoading(false)
    }

    const sessionServer = async () => {
        setIsLoading(true)
        const { data, error } = await getSessionServer()

        if(error) {
            toast.error(error)
            console.log(error)
            setIsLoading(false)
            return;
        }

        console.log(data)

        toast.message("session through server")
        queryClient.invalidateQueries({ queryKey: userQueries.session._def })
        setIsLoading(false)
    }

    const onDiscord = async () =>{ 
        setIsLoading(true)
        const { error, data } = await authClient.signIn.social({
            provider: "discord"
        })

        if(error) {
            toast.error(error?.message)
            console.log(error)
            setIsLoading(false)
            return;
        }

        console.log(data)

        toast.message("discord")
        queryClient.invalidateQueries({ queryKey: userQueries.session._def })
        setIsLoading(false)
    }

    if(isSessionLoading) return <>Loading...</>

    return (
        <div className="h-screen flex justify-center items-center">
            {data ? (
            <div className="flex flex-col gap-5">
                    <p className="text-xl">Logged in</p>
                    <LoadingButton
                        isLoading={isLoading}
                        variant="secondary"
                        onClick={() => session()}
                    >
                        Get session
                    </LoadingButton>
                    <LoadingButton
                        isLoading={isLoading}
                        variant="secondary"
                        onClick={() => sessionServer()}
                    >
                        Get session through server
                    </LoadingButton>
                    <LoadingButton
                        isLoading={isLoading}
                        onClick={() => logout()}
                    >
                        Logout
                    </LoadingButton>
                </div>
            ): (
                <div className="flex flex-col gap-5">
                    <p className="text-xl">Aint logged in</p>
                    <LoadingButton
                        isLoading={isLoading}
                        variant="secondary"
                        onClick={() => onDiscord()}
                    >
                        on Discord
                    </LoadingButton>
                    <LoadingButton
                        isLoading={isLoading}
                        onClick={() => login()}
                    >
                        Login
                    </LoadingButton>
                    <LoadingButton
                        variant="secondary"
                        isLoading={isLoading}
                        onClick={() => loginServer()}
                    >
                        Login through server
                    </LoadingButton>
                    <LoadingButton
                        isLoading={isLoading}
                        variant="secondary"
                        onClick={() => sessionServer()}
                    >
                        Get session through server
                    </LoadingButton>
                </div>
            )}
        </div>
    )
}