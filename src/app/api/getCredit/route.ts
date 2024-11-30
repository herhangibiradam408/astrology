import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const userId = body.userId;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        credit: true,
      },
    });

    return new Response(
      JSON.stringify({
        credit: user?.credit ?? 0,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Prisma error:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
