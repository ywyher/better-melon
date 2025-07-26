import { ChangeEmailTemplate } from "@/components/templates/email/change-email";
import { env } from "@/lib/env/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, url } = await req.json();

    const { data, error } = await resend.emails.send({
        from: `Acme <${env.RESEND_FROM_EMAIL}>`,
        to: email,
        subject: 'Hello world',
        react: ChangeEmailTemplate({ url: url }),
    });

    if (error) {
      console.error("Resend Error:", error);
      return NextResponse.json({ error }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}