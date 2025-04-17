'use server'

import { redirect } from 'next/navigation'

export default async function ResetPasswordPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token

  if (token) {
    console.log('has token')
    redirect(`${process.env.APP_URL}?reset-password-token=${token}`)
  } else {
    console.log('no token')
  }
}