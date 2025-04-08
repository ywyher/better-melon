import { OTPTemplate } from "@/components/templates/email/otp";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json(); // Get the email address from the request body
    console.log(email, otp)

    const { data, error } = await resend.emails.send({
        from: `Acme <${process.env.RESEND_FROM_EMAIL}>`, // Use your verified domain
        to: email,
        subject: 'Hello world',
        react: OTPTemplate({ firstName: 'John', otp: otp }),
    });

    if (error) {
        console.error("Resend Error:", error);
        return NextResponse.json({ error }, { status: 500 });
    } else {
        console.log('send successfully');
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