// app/api/lipsync/route.js

import { NextResponse } from "next/server";

export async function POST(req: any) {
  const { GOOEY_API_KEY } = process.env;

  if (!GOOEY_API_KEY) {
    return NextResponse.json({ error: "API key is missing" }, { status: 500 });
  }
  console.log("generating");
  const body = await req.json();
  const audioUrl = body.audioUrl;

  const payload = {
    input_face:
      "https://storage.googleapis.com/raygunbucket/LadyFortuna_Blinks.mp4",
    input_audio: audioUrl,
    selected_model: "Wav2Lip",
  };

  try {
    const response = await fetch("https://api.gooey.ai/v3/Lipsync/async/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GOOEY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const statusUrl = data.status_url;
    console.log("status:");
    console.log(statusUrl);
    return NextResponse.json({ status_url: statusUrl });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
