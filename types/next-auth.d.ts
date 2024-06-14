import NextAuth from "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      credit: number;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    credit: number;
  }
}
