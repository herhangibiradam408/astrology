// app/api/lipsync/status/route.js

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { GOOEY_API_KEY } = process.env;
  const { status_url } = body;

  if (!GOOEY_API_KEY) {
    return NextResponse.json({ error: "API key is missing" }, { status: 500 });
  }

  if (!status_url) {
    return NextResponse.json(
      { error: "Status URL is missing" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(status_url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${GOOEY_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();
    const status = result.status;

    if (status === "completed" || status === "failed") {
      return NextResponse.json(result);
    } else {
      console.log("not yet");
      return NextResponse.json({ status: "not yet" });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
