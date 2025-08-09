'use server'

import { env } from '@/lib/env/server'
import { redirect } from 'next/navigation'
import { toast } from 'sonner'

export default async function ResetPasswordPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ token?: string }> 
}) {
  const resolvedSearchParams = await searchParams
  const token = resolvedSearchParams.token

  if (token) {
    redirect(`${env.APP_URL}?reset-password-token=${token}`)
  } else {
    toast.error('no token')
  }
}