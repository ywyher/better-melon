import { ChangeEmailTemplate } from "@/components/templates/change-email";
import { env } from "@/lib/env/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const { email, url } = await req.json();

    if (!env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not provided - email sending disabled");
      return NextResponse.json(
        { error: "Email service not configured" }, 
        { status: 503 }
      );
    }

    const resend = new Resend(env.RESEND_API_KEY);

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