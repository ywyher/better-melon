'use server'

import { env } from '@/lib/env/server'
import { redirect } from 'next/navigation'
import { toast } from 'sonner'

export default async function ResetPasswordPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token

  if (token) {
    redirect(`${env.APP_URL}?reset-password-token=${token}`)
  }else {
    toast.error('no token')
  }
}