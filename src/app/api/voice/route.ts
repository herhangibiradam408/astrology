import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import fs from "fs";
import util from "util";
import { Storage } from "@google-cloud/storage";
import OpenAI from "openai";
import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
interface GooeyPayload {
  input_face: string;
  input_audio: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const bucketName = "raygun";
const storage = new Storage({
  projectId: "mimetic-algebra-426216-v3",
  keyFilename: "public/mimetic-algebra-426216-v3-6c71aa7e9d52.json",
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const inputText = body.inputText;
  const character = body.character;
  console.log(inputText);
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are Lady Fortuna and playing the role of an astrologer and an expert in cartomancy
who predicts the future by understanding the positions of the planets and Sun and Moon in the
birth chart of an individual. You can provide numerology if the name is provided. You can also
provide daily horoscopes based on today’s date and birthday. Your tarot card readings are
based on the energy transmitting through the computer. Provide your answer in the following
manner: 1) astrology predictions on love, health and wealth. 2) your numerology and your lucky
numbers. 3) your horoscope reading for today. You base your knowledge on this ancient Manual
of Cartomancy and Occult Divination. Never say contact a professional astrologer. Always close
your answer with that these are signs and predictions based on the information provided,
however my friend, your ultimate fate and destiny lies within you and the forces above.

`,
      },
      { role: "user", content: inputText },
    ],
    model: "gpt-4-0125-preview",
  });

  const content = await completion.choices[0].message.content;
  console.log("content:" + content);

  const request = {
    input: { text: content },
    voice: {
      languageCode: character === "AVA" ? "en-US" : "en-US",
      name: character === "AVA" ? "en-US-Standard-F" : "en-US-Casual-K",
      ssmlGender: character === "AVA" ? "FEMALE" : "MALE",
    },
    audioConfig: { audioEncoding: "MP3" },
  };

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${process.env.GOOGLE_CLOUD_API_KEY}`,
    {
      method: "POST",
      body: JSON.stringify(request),
    }
  );

  const resInfo = await response.json();
  console.log(resInfo);
  const audioContentBase64 = resInfo.audioContent;

  const audioBuffer = Buffer.from(audioContentBase64, "base64");

  const fileName = `output-${uuidv4()}.mp3`;
  const fileDestination = `${fileName}`;

  const file = storage.bucket(bucketName).file(fileDestination);

  await file.save(audioBuffer, {
    metadata: {
      contentType: "audio/mp3",
    },
  });

  console.log(
    "File URL:",
    `https://storage.googleapis.com/${bucketName}/${fileDestination}`
  );

  const payload = {
    input_face: "https://storage.googleapis.com/raygun/LadyFortuna_Blinks.mp4",
    input_audio: `https://storage.googleapis.com/${bucketName}/${fileDestination}`,
    selected_model: "Wav2Lip",
  };

  const result = await gooeyAPI(payload);
  return new Response(result.output.output_video);
}

async function gooeyAPI(payload: GooeyPayload) {
  const response = await fetch("https://api.gooey.ai/v2/Lipsync/", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + process.env["GOOEY_API_KEY"],
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  const result = await response.json();
  return result;
}
