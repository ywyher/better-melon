"use client"

import { z } from "zod"
import { FieldErrors, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { useState } from "react"
import LoadingButton from "@/components/loading-button"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { PasswordInput } from "@/components/form/password-input"
import { useIsSmall } from "@/lib/hooks/use-media-query"
import { passwordSchema } from "@/types/auth"
import { FormField } from "@/components/form/form-field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheckIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

const formSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type ResetPasswordValues = z.infer<typeof formSchema>

export function UpdatePassword() {
  const [isLoading, setIsLoading] = useState(false)
  const isSmall = useIsSmall()

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      oldPassword: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: ResetPasswordValues) => {
    setIsLoading(true)

    const { error } =  await authClient.changePassword({
        newPassword: data.password,
        currentPassword: data.oldPassword,
        revokeOtherSessions: true,
    });

    if(error) {
      toast.error(error.message)
      setIsLoading(false)
      return;
    }
    
    setIsLoading(false)
    toast.success("Password updated successfully")
    form.reset({
      oldPassword: "",
      password: "",
      confirmPassword: "",
    })
  }

  const onError = (errors: FieldErrors<ResetPasswordValues>) => {
      const position = isSmall ? "top-center" : "bottom-right"
      const firstError = Object.values(errors)[0];

      if (firstError?.message) {
        toast.error(firstError.message, { position });
      }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheckIcon className="h-5 w-5 text-primary" />
          Password Security
        </CardTitle>
        <CardDescription>Update your password to keep your account secure</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onError)} className="flex flex-col gap-6">
            <FormField
                form={form}
                label="Current Password"
                name="oldPassword"
            >
                <PasswordInput 
                  placeholder="Enter your current password"
                />
            </FormField>
            
            <FormField
                form={form}
                label="New Password"
                name="password"
            >
                <PasswordInput 
                  placeholder="Enter your new password"
                />
            </FormField>
            <FormField
                form={form}
                label="Confirm New Password"
                name="confirmPassword"
            >
                <PasswordInput 
                  placeholder="Confirm your new password"
                />
            </FormField>

            <LoadingButton isLoading={isLoading} className="w-full md:w-auto md:self-end">
              Update Password
            </LoadingButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export function UpdatePasswordSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-40 mb-1" />
        <Skeleton className="h-5 w-60" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}