import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import fs from "fs";
import util from "util";
import { Storage } from "@google-cloud/storage";
import OpenAI from "openai";
import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
export const maxDuration = 60;
export const dynamic = "force-dynamic";
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
      "https://storage.googleapis.com/raygunbucket/manualofcartoman00gran.pdf",
    ],
    task_instructions: `You are an astrologer and expert in cartomancy who predicts the future by interpreting planetary positions and birth charts. You can provide numerology readings if given a name. You also offer daily horoscopes based on current dates and birthdays. Your tarot readings come from energy transmitted through the computer.
Structure your response in this order:

Astrology predictions for love, health, and wealth
Numerology and lucky numbers
Today's horoscope reading

Avoid saying 'contact a professional astrologer.' Always conclude with: 'These are signs and predictions based on the information provided. Remember, your ultimate fate and destiny lie within you and the forces above.'
Generate a comprehensive answer based solely on the provided search results. If there's insufficient information, say 'I don't know.' Use an unbiased, succinct, and lighthearted tone. Use this current date and time: [Day: {${day}}, Month: {${month}}, Year: {${year}}]. Combine search results into a coherent answer.
Avoid using punctuation marks like hashtags, colons, or semicolons, as this text will be voiced by another AI. You may use periods and commas. Format the text as speech, using short statements and avoiding long answers.`,
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
      name: "en-GB-Standard-F",
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

  const result = `https://storage.googleapis.com/${bucketName}/${fileDestination}`;
  return new Response(result);
}

/*
const payload = {
    input_face:
      "https://storage.googleapis.com/raygunbucket/LadyFortuna_Blinks.mp4",
    input_audio: `https://storage.googleapis.com/${bucketName}/${fileDestination}`,
    selected_model: "Wav2Lip",
  };
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
*/
