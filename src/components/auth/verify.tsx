"use client"

import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { FieldErrors, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { toast } from "sonner";
import { useIsSmall } from "@/hooks/useMediaQuery";
import React, { Dispatch, SetStateAction, useState } from "react";
import { AuthPort } from "@/components/auth/auth";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { authClient } from "@/lib/auth-client";
import { auth } from "@/lib/auth";
import LoadingButton from "@/components/loading-button";

export const verifySchema = z.object({
    otp: z.string().min(6, "OTP is required."),
});

type FormValues = z.infer<typeof verifySchema>;

type VerifyProps = { 
    setPort: Dispatch<SetStateAction<AuthPort>>,
    setOpen: Dispatch<SetStateAction<boolean>>,
    email: string
    password: string
}

export default function Verify({ 
    setPort,
    setOpen,
    email,
    password
}: VerifyProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const isSmall = useIsSmall()

    const form = useForm<FormValues>({
        resolver: zodResolver(verifySchema),
        defaultValues: {
            otp: ""
        }
    })

    const onSubmit = async (formData: FormValues) => {
        if(!email || !password) return;
        setIsLoading(true)

        const { error: verifyEmailError } = await authClient.emailOtp.verifyEmail({
            email: email,
            otp: formData.otp
        })

        if(verifyEmailError) {
            toast.error(verifyEmailError.message)
            form.setError('otp', { message: "Invalid OTP" })
            setIsLoading(false)
            return;
        } 

        const { error: signInError } = await authClient.signIn.email({
            email: email,
            password: password,
        }) 

        if(signInError) {
            toast.error(signInError.message)
            setIsLoading(false)
            return;
        }

        setOpen(false)
        setPort('check')
    }

    const onError = (errors: FieldErrors<FormValues>) => {
        const position = isSmall ? "top-center" : "bottom-right"
        if (errors.otp) {
            toast.error(errors.otp.message, { position });
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit, onError)}
                className="flex flex-col gap-4 justify-center items-center w-full max-w-sm mx-auto"
            >
                <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                    <FormItem className="w-full">
                    <FormLabel className="text-center block text-lg mb-2 font-semibold">
                        One-Time Password
                    </FormLabel>
                    <FormControl>
                        <InputOTP
                            maxLength={6}
                            {...field}
                        >
                        <InputOTPGroup className="flex flex-row gap-3">
                            {[...Array(6)].map((_, index) =>
                                index === 2 ? (
                                    <React.Fragment key={index}>
                                        <InputOTPSlot
                                            index={index}
                                            className="w-11 h-12 text-xl text-center border rounded-md focus:ring-2 focus:ring-primary transition-all"
                                        />
                                        <InputOTPSeparator className="mx-2 text-lg" />
                                    </React.Fragment>
                                ) : (
                                    <InputOTPSlot
                                    key={index}
                                    index={index}
                                    className="w-11 h-12 text-xl text-center border rounded-md focus:ring-2 focus:ring-primary transition-all"
                                    />
                                )
                            )}
                        </InputOTPGroup>
                        </InputOTP>
                    </FormControl>
                    </FormItem>
                )}
                />
                <LoadingButton isLoading={isLoading} className="w-full mt-4">Verify</LoadingButton>
            </form>
        </Form>
    )
}