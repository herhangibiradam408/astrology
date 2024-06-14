import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { NextRequest } from "next/server";

const client = new DynamoDBClient({
  credentials: {
    accessKeyId: process.env.AUTH_DYNAMODB_ID || "",
    secretAccessKey: process.env.AUTH_DYNAMODB_SECRET || "",
  },
  region: process.env.AUTH_DYNAMODB_REGION || "",
});
const ddbDocClient = DynamoDBDocumentClient.from(client);

export async function POST(req: NextRequest) {
  const body = await req.json();

  const userId = body.userId;
  if (!userId) {
    return new Response("User ID is required", { status: 400 });
  }

  const command = new GetCommand({
    TableName: "astrology",
    Key: { pk: `USER#${userId}`, sk: `USER#${userId}` },
  });

  try {
    const result = await ddbDocClient.send(command);
    console.log(result!.Item!.credit);
    if (result.Item) {
      return new Response(JSON.stringify({ credit: result.Item.credit }));
    } else {
      return new Response("User not found", { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching user credit:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
