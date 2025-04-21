"use client";

import { editProfile } from "@/app/profile/actions";
import LoadingButton from "@/components/loading-button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useIsSmall } from "@/hooks/useMediaQuery";
import { User } from "@/lib/db/schema";
import { emailSchema, usernameSchema } from "@/types/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const editProfileSchema = z.object({
    username: usernameSchema,
    email: emailSchema
})

type FormValues = z.infer<typeof editProfileSchema>

export default function EditProfile({ user }: { user: User }) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const isSmall = useIsSmall()

    const form = useForm<FormValues>({
        resolver: zodResolver(editProfileSchema),
        defaultValues: {
            email: user.email,
            username: user.name,
        }
    })

    const onSubmit = async (data: FormValues) => {
        setIsLoading(true)

        const { message, error } = await editProfile({ data, userId: user.id })

        if(error) {
            toast.error(error)
            return;
        }
        
        toast.message(message)
        setIsLoading(false)
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
            <form onSubmit={form.handleSubmit(onSubmit, onError)} className="flex flex-col gap-4">
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
                                <Input {...field} />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <LoadingButton isLoading={isLoading}>
                    Save Changes
                </LoadingButton>
            </form>
        </Form>
    )
}