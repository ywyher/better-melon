"use client"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FieldError, FieldErrors, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useIsSmall } from "@/hooks/useMediaQuery";
import { Dispatch, SetStateAction, useState } from "react";
import { AuthPort } from "@/components/auth/auth";
import { checkEmail } from "@/components/auth/actions";
import { authClient } from "@/lib/auth-client";
import LoadingButton from "@/components/loading-button";

export const checkSchema = z.object({
    email: z.string().email().min(2, "Email."),
});

type FormValues = z.infer<typeof checkSchema>;

export default function Check({ setPort, setEmail }: { setPort: Dispatch<SetStateAction<AuthPort>>, setEmail: Dispatch<SetStateAction<string>> }) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const isSmall = useIsSmall()

    const form = useForm<FormValues>({
        resolver: zodResolver(checkSchema),
        defaultValues: {
            email: ""
        }
    })

    const onSubmit = async (data: FormValues) => {
        setIsLoading(true)
        const { exists, verified } = await checkEmail({ data });
        
        if(exists && verified) {
            setPort("login")
        }else if(!exists) {
            setPort("register")
        }else if (exists && !verified) {
            const { error } = await authClient.emailOtp.sendVerificationOtp({
                email: data.email,
                type: "email-verification"
            })
            
            if(error) {
                toast.error(error.message)
                setIsLoading(false)
                return;
            }

            setPort('verify')
        }
        
        setEmail(data.email)
        setIsLoading(false)
    }

    const onError = (errors: FieldErrors<FormValues>) => {
        const position = isSmall ? "top-center" : "bottom-right"
        if (errors.email) {
            toast.error(errors.email.message, { position });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)}>
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="m@example.com" {...field} />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <LoadingButton isLoading={isLoading} className="w-full mt-4">Verify</LoadingButton>
            </form>
        </Form>
    )
}