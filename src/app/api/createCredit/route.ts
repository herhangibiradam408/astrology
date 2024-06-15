import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
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

  const command = new UpdateCommand({
    TableName: "astrology",
    Key: { pk: `USER#${userId}`, sk: `USER#${userId}` },
    UpdateExpression: "SET credit = if_not_exists(credit, :start)",
    ExpressionAttributeValues: {
      ":start": 10,
    },
    ConditionExpression: "attribute_not_exists(credit)",
    ReturnValues: "UPDATED_NEW",
  });

  try {
    const result = await ddbDocClient.send(command);
    return new Response(
      JSON.stringify({
        message: "Credit initialized",
        credits: result!.Attributes!.credit,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name === "ConditionalCheckFailedException") {
      return new Response(
        JSON.stringify({ message: "Credit already exists" }),
        { status: 409 }
      );
    } else {
      console.error("DynamoDB error:", error);
      return new Response(
        JSON.stringify({ message: "Internal Server Error" }),
        { status: 500 }
      );
    }
  }
}
