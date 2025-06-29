import { OTPTemplate } from "@/components/templates/email/otp";
import { env } from "@/lib/env/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json(); // Get the email address from the request body

    const { data, error } = await resend.emails.send({
        from: `Acme <${env.RESEND_FROM_EMAIL}>`, // Use your verified domain
        to: email,
        subject: 'Hello world',
        react: OTPTemplate({ firstName: 'John', otp: otp }),
    });

    if (error) {
      console.error("Resend Error:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}