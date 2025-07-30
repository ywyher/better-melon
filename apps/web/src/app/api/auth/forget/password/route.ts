import { ForgetPassowrdEmailTemplate } from "@/components/templates/email/forget-password";
import { env } from "@/lib/env/server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, url, name } = await req.json();

    if (!name || !email || !url) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    // Use query parameters for your logic
    const { data, error } = await resend.emails.send({
      from: `Acme <${env.RESEND_FROM_EMAIL}>`,
      to: email,
      subject: "Hello world",
      react: await ForgetPassowrdEmailTemplate({ firstname: name, url: url }),
    });

    if (error) {
      console.error("Resend Error:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
