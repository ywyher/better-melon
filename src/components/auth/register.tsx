"use client"

import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { FieldErrors, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useIsSmall } from "@/hooks/useMediaQuery";
import { PasswordInput } from "@/components/form/password-input";
import { authClient } from "@/lib/auth-client";
import { Dispatch, SetStateAction, useState } from "react";
import { AuthPort } from "@/components/auth/auth";
import LoadingButton from "@/components/loading-button";
import { emailSchema, passwordSchema, usernameSchema } from "@/types";

export const registerSchema = z.object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
});

type FormValues = z.infer<typeof registerSchema>;

type RegisterProps = { 
    setPort: Dispatch<SetStateAction<AuthPort>>,
    email: string
    setPassword: Dispatch<SetStateAction<string>>,
}

export default function Register({ setPort, email, setPassword }: RegisterProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const isSmall = useIsSmall()

    const form = useForm<FormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: email || "",
            password: "",
            username: "",
        }
    })

    const onSubmit = async (formData: FormValues) => {
        setIsLoading(true)
        const result = await authClient.signUp.email({
            email: formData.email,
            password: formData.password,
            name: formData.username,
        });

        if(result.error) {
            toast.error(result.error.message)
            setIsLoading(false)
            return;
        }
        
        const { error } = await authClient.emailOtp.sendVerificationOtp({
            email: formData.email,
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
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        disabled
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input disabled placeholder="m@example.com" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <PasswordInput {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
                <LoadingButton isLoading={isLoading} className="w-full mt-4">Register</LoadingButton>
            </form>
        </Form>
    )
}