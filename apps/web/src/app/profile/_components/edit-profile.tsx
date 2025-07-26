"use client";

import { editProfile } from "@/app/profile/actions";
import { FormField } from "@/components/form/form-field";
import LoadingButton from "@/components/loading-button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useIsSmall } from "@/lib/hooks/use-media-query";
import { User } from "@/lib/db/schema";
import { emailSchema, usernameSchema } from "@/types/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { userQueries } from "@/lib/queries/user";

export const editProfileSchema = z.object({
  username: usernameSchema,
  email: emailSchema
})

type FormValues = z.infer<typeof editProfileSchema>

export default function EditProfile({ user }: { user: User }) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const isSmall = useIsSmall()
    const queryClient = useQueryClient()

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
      
      queryClient.invalidateQueries({ queryKey: userQueries.session._def })
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
        <Card>
            <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit, onError)} className="flex flex-col gap-6">
                        <FormField
                            form={form}
                            label="Username"
                            name="username"
                        >
                            <Input 
                                placeholder="Enter your username"
                            />
                        </FormField>
                        
                        <FormField
                            form={form}
                            label="Email"
                            name="email"
                            disabled
                        >
                            <Input 
                                placeholder="Enter your email"
                            />
                        </FormField>

                        <LoadingButton isLoading={isLoading} className="w-full md:w-auto md:self-end">
                            Save Changes
                        </LoadingButton>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

export function EditProfileSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-48 mb-1" />
                <Skeleton className="h-5 w-64" />
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-6">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="flex justify-end">
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}