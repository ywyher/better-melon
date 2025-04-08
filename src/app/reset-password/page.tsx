import { redirect } from "next/navigation";

interface ResetPasswordPageProps {
    searchParams: { token?: string };
}
  
export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
    const token = searchParams.token;

    if(token) {
        redirect(`${process.env.APP_URL}?reset-password-token=${token}`)
    }
}
  