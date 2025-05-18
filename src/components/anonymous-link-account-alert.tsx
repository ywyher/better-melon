"use client"

import LoadingButton from "@/components/loading-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { deleteUser } from "@/lib/db/mutations"
import { User } from "@/lib/db/schema"
import { userQueries } from "@/lib/queries/user"
import { useQueryClient } from "@tanstack/react-query"
import { AlertCircle } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export default function AnonymousLinkAccountAlert({ userId }: { userId: User['id'] }) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const queryClient = useQueryClient()

    const handleAccountDeletion = async () => {
        setIsLoading(true)
        const { error, message } = await deleteUser({ userId })

        if(error) {
            toast.error(error)
            setIsLoading(false)
            return;
        }

        queryClient.invalidateQueries({ queryKey: userQueries.session._def })
        toast.message(message)
        setIsLoading(false)
    }

    return (
        <Alert className="flex justify-between">
            <div className="flex flex-row gap-1 items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <div className="flex flex-col">
                    <AlertTitle>
                        Anonymous activities will be linked.
                    </AlertTitle>
                    <AlertDescription>
                        Delete now if preferred
                    </AlertDescription>
                </div>
            </div>
            <LoadingButton
                variant="destructive"
                isLoading={isLoading}
                onClick={handleAccountDeletion}
                className="text-xs py-1 px-2 h-full w-fit"
            >
                Delete
            </LoadingButton>
        </Alert>
    )
}