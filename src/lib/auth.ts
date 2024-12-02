import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "./prisma";
import nodemailer from "nodemailer";

const sendVerificationRequest = async ({
  identifier,
  url,
  provider,
}: any): Promise<void> => {
  const { server, from } = provider;
  const transport = nodemailer.createTransport(server);
  const message = {
    to: identifier,
    from,
    subject: "Sign in to Lady Fortuna",
    html: `
      <div style="padding: 40px 0; background: #f9f9f9;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
          <h1 style="color: #333333; font-size: 24px; font-weight: 600; margin-bottom: 20px; font-family: Arial, sans-serif;">Welcome to Lady Fortuna</h1>
          <p style="color: #666666; font-size: 16px; line-height: 24px; margin-bottom: 30px; font-family: Arial, sans-serif;">
            Click the button below to sign in to your account:
          </p>
          <a href="${url}" 
             style="display: inline-block; 
                    background-color: #000000; 
                    color: #ffffff; 
                    padding: 14px 28px; 
                    text-decoration: none; 
                    border-radius: 6px;
                    font-family: Arial, sans-serif;
                    font-size: 16px;
                    font-weight: 500;
                    transition: background-color 0.2s;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            Sign In
          </a>
          <p style="color: #999999; font-size: 14px; margin-top: 30px; font-family: Arial, sans-serif;">
            If you didn't request this email, you can safely ignore it.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transport.sendMail(message);
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      sendVerificationRequest,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  pages: {
    signIn: "/",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, token, user }) {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};
