import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request body
    const body = await request.json();
    const { action, version, params } = body;

    // Validate required fields
    if (!action || version === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: action or version" },
        { status: 400 }
      );
    }

    // Forward the request to Anki Connect
    const ankiConnectUrl = process.env.ANKI_CONNECT_URL;
    if (!ankiConnectUrl) {
      return NextResponse.json(
        { error: "Anki Connect URL is not configured on the server" },
        { status: 500 }
      );
    }

    const response = await fetch(ankiConnectUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, version, params }),
    });

    const data = await response.json();

    // Validate Anki Connect response format
    if (Object.keys(data).length !== 2) {
      return NextResponse.json(
        { error: 'Response has an unexpected number of fields' },
        { status: 500 }
      );
    }

    if (!('error' in data)) {
      return NextResponse.json(
        { error: 'Response is missing required error field' },
        { status: 500 }
      );
    }

    if (!('result' in data)) {
      return NextResponse.json(
        { error: 'Response is missing required result field' },
        { status: 500 }
      );
    }

    // Return the response from Anki Connect
    if (data.error) {
      return NextResponse.json({ data: null, error: data.error }, { status: 400 });
    }

    return NextResponse.json({ data: data.result, error: null }, { status: 200 });
  } catch (error) {
    console.error('Error connecting to Anki:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to connect to Anki' },
      { status: 500 }
    );
  }
}