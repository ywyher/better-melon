"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

export default function GoBack() {
    const router = useRouter()
    const params = useParams<{ id: string; ep: string }>();

    return (
        <Button
            onClick={() => {
                router.push(`/info/${params.id}`)
            }}
            variant='ghost'
            className="w-fit"
        >
            <ArrowLeft className="me-2" /> Go Back
        </Button>
    )
}