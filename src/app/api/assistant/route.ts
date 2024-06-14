import { NextRequest } from "next/server";
import { OpenAIAssistantRunnable } from "langchain/experimental/openai_assistant";
import { OpenAIFiles } from "langchain/experimental/openai_files";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  console.log(process.cwd());
  const openAIFiles = new OpenAIFiles();
  const file = await openAIFiles.createFile({
    file: fs.createReadStream(
      path.resolve(__dirname, `./local_sample_file.pdf`)
    ),
    purpose: "assistants",
  });

  console.log("file:");
  console.log(file);
  const agent = await OpenAIAssistantRunnable.createAssistant({
    clientOptions: { apiKey: process.env.OPENAI_API_KEY },
    model: "gpt-3.5-turbo-1106",
    instructions:
      "You are a weather bot. Use the provided functions to answer questions.",
    name: "Weather Assistant",
    tools: [{ type: "file_search" }],
    asAgent: true,
    fileIds: [file.id],
  });

  console.log(agent);
  return new Response("OK");
}
//asst_BCNkGtWKPW2bOyNyKjxwIjtQ
