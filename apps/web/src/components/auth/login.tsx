"use client"

import LoadingButton from "@/components/loading-button";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/form/form-field";
import { useIsSmall } from "@/lib/hooks/use-media-query";
import { authClient } from "@/lib/auth-client";
import { PasswordInput } from "@/components/form/password-input";
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from "@tanstack/react-query";
import { FieldErrors, useForm } from "react-hook-form";
import { AuthIdentifier, AuthPort } from "@/components/auth/auth";
import { identifierSchema, passwordSchema } from "@/types/auth";
import { Dispatch, SetStateAction, useState } from "react";
import { getEmailByUsername, getIsAccountVerified, getShouldVerifyEmail } from "@/components/auth/actions";

export const loginSchema = z.object({
    identifier: identifierSchema,
    password: passwordSchema
});

type FormValues = z.infer<typeof loginSchema>;

type LoginProps = { 
    setOpen: (isAuthDialogOpen: boolean) => void,
    setPort: Dispatch<SetStateAction<AuthPort>>,
    setPassword: Dispatch<SetStateAction<string>>,
    identifierValue: string
    identifier: AuthIdentifier
}

export default function Login({ setPort, identifier, identifierValue, setOpen, setPassword }: LoginProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const queryClient = useQueryClient()
    const isSmall = useIsSmall()
    const router = useRouter()

    const form = useForm<FormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            identifier: identifierValue,
            password: "",
        }
    })

    const onSubmit = async (formData: FormValues) => {
        setIsLoading(true)

        let email: string | null = identifierValue;
        if(identifier == 'username') {
            email = await getEmailByUsername(identifierValue) || null
        }
        if(!email) {
            toast.error("Failed to get email")
            setIsLoading(false)
            return
        }

        const isAccountVerified = await getIsAccountVerified(email)
        const shouldVerifyEmail = await getShouldVerifyEmail()

        try {
            if(isAccountVerified || !shouldVerifyEmail) {
                const result = await authClient.signIn.email({
                    email: email,
                    password: formData.password,
                });
        
                if(result.error) {
                    toast.error(result.error.message);
                    setIsLoading(false);
                    return;
                }
                
                queryClient.clear()
                router.refresh()
                toast.success("Logged in successfully")
                setIsLoading(false)
                setOpen(false)
                setPort('check')
            }else {
                const { error } = await authClient.emailOtp.sendVerificationOtp({
                    email: email,
                    type: "email-verification"
                })
                
                if(error) {
                    toast.error(error.message)
                    setIsLoading(false)
                    return;
                }
        
                setPassword(formData.password)
                setPort('verify')
            }
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Failed"
            setIsLoading(false)
            toast.error(msg)
        }
    }

    const onForgetPassword = async () => {
        setIsLoading(true)

        const shouldVerifyEmail = await getShouldVerifyEmail()

        if(!shouldVerifyEmail) {
            toast.error("This action is disabled at the moment.")
            setIsLoading(false)
            return
        }


        let email: string | null = identifierValue;
        if(identifier == 'username') {
            email = await getEmailByUsername(identifierValue) || null
        }

        if(!email) {
            toast.error("Failed to get email")
            setIsLoading(false)
            return
        }

        const { error } = await authClient.forgetPassword({
            email: email,
            redirectTo: "/reset-password",
        });

        if(error) {
            toast.error(error.message)
            setIsLoading(false)
            return;
        }
        
        setIsLoading(false)
        toast.success("Password Reset Link Sent Successfully", {
            description: "May Take 1-5 Minutes",
        });
    }

    const onError = (errors: FieldErrors<FormValues>) => {
        const position = isSmall ? "top-center" : "bottom-right"
        const firstError = Object.values(errors)[0];

        if (firstError?.message) {
          toast.error(firstError.message, { position });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)}>
                <div className="flex flex-col gap-4">
                    <FormField
                        form={form}
                        label={identifier}
                        name="identifier"
                        disabled
                    >
                        <Input />
                    </FormField>
                    <FormField
                        form={form}
                        label="Password"
                        name="password"
                    >
                        <PasswordInput />
                    </FormField>
                </div>
                <Button
                    variant="link"
                    className="p-0 pt-3"
                    onClick={() => onForgetPassword()}
                    type="button"
                >
                    Forget password ?
                </Button>
                <LoadingButton isLoading={isLoading} className="w-full mt-4">Login</LoadingButton>
            </form>
        </Form>
    )
}