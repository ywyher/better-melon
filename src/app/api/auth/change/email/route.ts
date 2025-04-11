import { ChangeEmailTemplate } from "@/components/templates/email/change-email";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, url } = await req.json(); // Get the email address from the request body

    console.log(`JU#HUNDjandansd`)
    console.log(email, url)

    const { data, error } = await resend.emails.send({
        from: `Acme <${process.env.RESEND_FROM_EMAIL}>`,
        to: email,
        subject: 'Hello world',
        react: ChangeEmailTemplate({ url: url }),
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