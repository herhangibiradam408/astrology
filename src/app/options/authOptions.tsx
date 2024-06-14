import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { DynamoDB, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDBAdapter } from "@next-auth/dynamodb-adapter";
import { AuthOptions } from "next-auth";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import sendVerificationRequest from "./sendVerificationRequest";
const config: DynamoDBClientConfig = {
  credentials: {
    accessKeyId: process.env.AUTH_DYNAMODB_ID || "",
    secretAccessKey: process.env.AUTH_DYNAMODB_SECRET || "",
  },
  region: process.env.AUTH_DYNAMODB_REGION,
};

const client = DynamoDBDocument.from(new DynamoDB(config), {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
});

async function getUserCredit(userId: string) {
  const command = new GetCommand({
    TableName: "astrology",
    Key: { pk: `USER#${userId}`, sk: `USER#${userId}` },
  });
  try {
    const result = await client.send(command);
    return result.Item?.credit || 0;
  } catch (error) {
    console.error("Error fetching user credit:", error);
    return 0;
  }
}

export const authOptions: AuthOptions = {
  adapter: DynamoDBAdapter(client),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      sendVerificationRequest({
        identifier: email,
        url,
        provider: { server, from },
      }) {
        sendVerificationRequest({
          identifier: email,
          url,
          provider: { server, from },
        });
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      const credit = await getUserCredit(user.id);
      session!.user!.id = user.id;
      session!.user!.credit = credit;
      return session;
    },
  },
};

/*

callbacks: {
    async session({ session, user }) {
      session!.user!.id = user.id;
      return session;
    },
  },*/
