import { redirect } from "next/navigation";

type Params = Promise<{ token: string }>
  
export default async function ResetPasswordPage({ params }: { params: Params }) {
    const { token } = await params ;

    if(token) {
        redirect(`${process.env.APP_URL}?reset-password-token=${token}`)
    }
}