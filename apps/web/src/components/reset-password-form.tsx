"use client"

import { z } from "zod"
import { FieldErrors, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { useState } from "react"
import LoadingButton from "@/components/loading-button"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { PasswordInput } from "@/components/form/password-input"
import { useIsSmall } from "@/lib/hooks/use-media-query"
import { passwordSchema } from "@/types/auth"

const formSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type ResetPasswordValues = z.infer<typeof formSchema>

export function ResetPasswordForm({ token }: { token: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const isSmall = useIsSmall()
  const router = useRouter()

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: ResetPasswordValues) => {
    setIsLoading(true)

    const { error } = await authClient.resetPassword({
      newPassword: data.password,
      token,
    });

    if(error) {
      toast.error(error.message)
      setIsLoading(false)
      return;
    }
    
    setIsLoading(false)
    toast.success("Password reset successfully ")
    router.replace('/')
  }

  const onError = (errors: FieldErrors<ResetPasswordValues>) => {
      const position = isSmall ? "top-center" : "bottom-right"
      const firstError = Object.values(errors)[0];

      if (firstError?.message) {
        toast.error(firstError.message, { position });
      }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6 max-w-md">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <PasswordInput  {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <PasswordInput {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <LoadingButton isLoading={isLoading} className="w-full">
          Reset Password
        </LoadingButton>
      </form>
    </Form>
  )
}