"use client"

import Check from "@/components/auth/check"
import Login from "@/components/auth/login"
import Register from "@/components/auth/register"
import Verify from "@/components/auth/verify"
import DialogWrapper from "@/components/dialog-wrapper"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Dispatch, SetStateAction, useEffect, useState } from "react"

export type AuthPort = "login" | "register" | "check" | "verify"
export type AuthIdentifier = "email" | "username"

type AuthProps = {
    open: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>
}

export default function Auth({ open, setOpen }: AuthProps) {
    const [port, setPort] = useState<AuthPort>("check")
    const [identifier, setIdentifier] = useState<AuthIdentifier | null>(null)
    const [identifierValue, setIdentifierValue] = useState<string>("")
    const [password, setPassword] = useState<string>("")

    const handleGoBack = () => {
        setPort("check");
    };

    return (
        <DialogWrapper title="Authentication" open={open} setOpen={setOpen}>
            {(port === "register" || port === "login") && (
                <Button
                    variant="link"
                    className="p-0 text-sm m-0"
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
                />
            )}
            {port == 'register' && (
                <Register 
                    setPort={setPort}
                    email={identifierValue}
                    setPassword={setPassword}
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
        </DialogWrapper>
    )
}