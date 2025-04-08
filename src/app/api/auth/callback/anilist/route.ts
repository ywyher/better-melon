import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');

    if (!code) {
      return NextResponse.json({ token: null, error: "Code is required" }, { status: 401 });
    }

    const tokenResponse = await fetch("https://anilist.co/api/v2/oauth/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            "grant_type": "authorization_code",
            "client_id": `${process.env.ANILIST_ID}`,
            "client_secret": `${process.env.ANILIST_SECRET}`,
            "redirect_uri": `${process.env.ANILIST_REDIRECT_URL}`,
            "code": code
        })
    });

    const tokenData = await tokenResponse.json();

    return NextResponse.json({ token: tokenData, error: null }, { status: 200 });
  } catch (error) {
    console.log(error);
    console.error(error);
    return NextResponse.json(
      { data: null, error: 'Failed to connect to Anki' },
      { status: 500 }
    );
  }
}