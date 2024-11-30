import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

// Prisma client'ı singleton olarak tanımla
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const userId = body.userId;
  const requestedCredit = body.requestedCredit || 1;

  try {
    // Prisma ile kredi güncelleme
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        credit: {
          increment: requestedCredit,
        },
      },
      select: {
        credit: true,
      },
    });

    return new Response(
      JSON.stringify({
        message: "Credit added successfully",
        newCreditTotal: updatedUser.credit,
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
