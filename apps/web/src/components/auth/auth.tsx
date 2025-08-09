"use client"

import Check from "@/components/auth/check"
import Login from "@/components/auth/login"
import Register from "@/components/auth/register"
import Verify from "@/components/auth/verify"
import DialogWrapper from "@/components/dialog-wrapper"
import AnonymousLinkAccountAlert from "@/components/anonymous-link-account-alert"
import { Button } from "@/components/ui/button"
import { User } from "@/lib/db/schema"
import { ArrowLeft } from "lucide-react"
import { useState } from "react"

export type AuthPort = "login" | "register" | "check" | "verify"
export type AuthIdentifier = "email" | "username"

type AuthProps = {
    user?: User
}

export default function Auth({ user }: AuthProps) {
    const [open, setOpen] = useState(false)
    const [port, setPort] = useState<AuthPort>("check")
    const [identifier, setIdentifier] = useState<AuthIdentifier | null>(null)
    const [identifierValue, setIdentifierValue] = useState<string>("")
    const [password, setPassword] = useState<string>("")

    const handleGoBack = () => {
        setPort("check");
    };

    return (
        <DialogWrapper 
            title="Authentication" 
            open={open} 
            setOpen={setOpen}
            trigger={
                <Button
                    variant='outline'
                >
                    Auth
                </Button>
            }
        >
            {(port === "register" || port === "login") && (
                <Button
                    variant="link"
                    className="flex justify-start text-sm m-0 p-0 w-fit"
                    onClick={handleGoBack}
                >
                    <ArrowLeft size={12} /> Go Back
                </Button>
            )}
            {port == 'check' && (
                <Check 
                    setPort={setPort} 
                    setIdentifierValue={setIdentifierValue}
                    setIdentifier={setIdentifier}
                />
            )}
            {port == 'login' && (
                <Login 
                    setPort={setPort} 
                    identifierValue={identifierValue} 
                    setOpen={setOpen} 
                    identifier={identifier as AuthIdentifier}
                    setPassword={setPassword}
                />
            )}
            {port == 'register' && (
                <Register
                    setPort={setPort}
                    email={identifierValue}
                    setPassword={setPassword}
                    setOpen={setOpen}
                />
            )}
            {port == 'verify' && (
                <Verify 
                    setPort={setPort}
                    identifierValue={identifierValue}
                    identifier={identifier as AuthIdentifier}
                    password={password}
                    setOpen={setOpen}
                />
            )}
            {user && user.isAnonymous && (
                <AnonymousLinkAccountAlert
                    userId={user.id}
                />
            )}
        </DialogWrapper>
    )
}