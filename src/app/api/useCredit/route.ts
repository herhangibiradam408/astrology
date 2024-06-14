import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { NextRequest } from "next/server";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
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

  const currentCredits = await getCurrentCredits(userId);
  if (currentCredits <= 0) {
    return new Response(
      JSON.stringify({
        message: "Insufficient credits",
      }),
      { status: 403 }
    );
  }

  const command = new UpdateCommand({
    TableName: "astrology",
    Key: { pk: `USER#${userId}`, sk: `USER#${userId}` },
    UpdateExpression: "ADD credit :dec",
    ExpressionAttributeValues: {
      ":dec": -1,
    },
    ReturnValues: "UPDATED_NEW",
  });

  try {
    const result = await ddbDocClient.send(command);
    return new Response(
      JSON.stringify({
        message: "Credit used successfully",
        newCreditTotal: result!.Attributes!.credit,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("DynamoDB error:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}

async function getCurrentCredits(userId: string) {
  const getItemCommand = new GetCommand({
    TableName: "spacecraft",
    Key: { pk: `USER#${userId}`, sk: `USER#${userId}` },
  });

  try {
    const data = await ddbDocClient.send(getItemCommand);
    return data.Item ? data.Item.credit : 0;
  } catch (error) {
    console.error("Error retrieving credits:", error);
    return 0;
  }
}
