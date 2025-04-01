"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function GoBack() {
    const router = useRouter()
    return (
        <Button
            onClick={() => {
                router.back()
            }}
            variant='ghost'
            className="w-fit"
        >
            <ArrowLeft className="me-2" /> Go Back
        </Button>
    )
}