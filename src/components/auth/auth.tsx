"use client"

import Check from "@/components/auth/check"
import Login from "@/components/auth/login"
import Register from "@/components/auth/register"
import Verify from "@/components/auth/verify"
import DialogWrapper from "@/components/dialog-wrapper"
import { useState } from "react"

export type AuthPort = "login" | "register" | "check" | "verify"

export default function Auth() {
    const [port, setPort] = useState<AuthPort>("check")
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [open, setOpen] = useState<boolean>(true)

    return (
        <DialogWrapper title="Authentication" open={open} onOpenChange={setOpen}>
            {port == 'check' && (
                <Check setPort={setPort} setEmail={setEmail} />
            )}
            {port == 'login' && (
                <Login setPort={setPort} email={email} setOpen={setOpen} />
            )}
            {port == 'register' && (
                <Register setPort={setPort} email={email} setPassword={setPassword} />
            )}
            {port == 'verify' && (
                <Verify setPort={setPort} email={email} password={password} setOpen={setOpen} />
            )}
        </DialogWrapper>
    )
}