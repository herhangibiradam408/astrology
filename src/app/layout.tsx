import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "./options/authOptions";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Lady Fortuna",
  description: "Lady Fortuna",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <Head>
        <script src="https://www.paypal.com/sdk/js?client-id=BAA93KMHLc6-DecbhTiai1oIwLjx1nyWQupHLk7kqf7Ffd8dcypMFkNyES8LQpF7R1YVknDTuNfFgK1cnI&enable-funding=venmo&currency=USD"></script>
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="android-chrome-192x192"
          sizes="192x192"
          href="/android-chrome-192x192.png"
        />
        <link
          rel="android-chrome-512x512"
          sizes="512x512"
          href="/android-chrome-512x512.png"
        />
        <title>RAYGUN</title>
      </Head>
      <body className={`${bebasNeue.className} bg-black`}>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
