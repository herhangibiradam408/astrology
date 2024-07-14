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

const bucketName = "raygunbucket";
const storage = new Storage({
  projectId: process.env.PROJECT_ID,
  credentials: JSON.parse(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || ""
  ),
});

function removeReferences(text: string) {
  const cleanedText = text.replace(/\[\d+\]/g, "");
  return cleanedText;
}
export async function POST(req: NextRequest) {
  const curDate = new Date();
  const day = curDate.getDate();
  const month = curDate.getMonth() + 1;
  const year = curDate.getFullYear();
  const body = await req.json();
  const inputText = body.inputText;
  const name = body.name;
  const dateOfBirth = body.dateOfBirth;
  const timeOfBirth = body.timeOfBirth;
  const location = body.location;
  const character = body.character;
  console.log("name: " + name);
  console.log("dateOfbirth: " + dateOfBirth);
  console.log("timeOfbirth: " + timeOfBirth);
  console.log("location: " + location);

  console.log(inputText);

  const payloadText = {
    search_query: `Name: ${name}, Date of Birth: ${dateOfBirth}, Time of Birth: ${timeOfBirth}, Location: ${location}`,
    documents: [
      "https://raygunbucket.s3.amazonaws.com/manualofcartoman00gran.pdf",
    ],
    task_instructions: `You are playing the role of an astrologer and an expert in cartomancy who predicts the future by understanding the positions of the planets and Sun and Moon in the birth chart of an individual. You can provide numerology if the name is provided. You can also provide daily horoscopes based on today’s date and birthday. Your tarot card readings are based on the energy transmitting through the computer. Provide your answer in the following manner: 1) astrology predictions on love, health and wealth. 2) your numerology and your lucky numbers. 3) your horoscope reading for today. Never say contact a professional astrologer. Always close your answer with that these are signs and predictions based on the information provided, however remember my friend, your ultimate fate and destiny lies within you and the forces above.
      Generate a comprehensive, factoid Answer the for the following Question soely based on the provided Search Results. If the Search Results do not contain enough information, say "I don't know". Use an unbiased, succinct, and funny tone. Use this current date and time: {${`Day: ${day}, Month: ${month}, Year: ${year}`}}. Combine Search Results together into a coherent answer. Do not use punctuation marks like # * : because this text will be voiced by another AI(You can use . and ,). Make it like a speech text. make short statements, don't give long answers
      `,
    max_tokens: 1024,
  };

  const responseText = await fetch("https://api.gooey.ai/v2/doc-search/", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + process.env["GOOEY_API_KEY"],
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payloadText),
  });

  if (!responseText.ok) {
    throw new Error(`HTTP Error: ${responseText.status}`);
  }

  const resultText = await responseText.json();
  const retrievalResponse = removeReferences(resultText.output.output_text[0]);
  console.log("retrieval response:");
  console.log(retrievalResponse);
  const request = {
    input: { text: retrievalResponse },
    voice: {
      languageCode: "en-US",
      name: "en-US-Neural2-C",
      ssmlGender: "FEMALE",
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
    input_face: "https://raygunbucket.s3.amazonaws.com/LadyFortuna_Blinks.mp4",
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
