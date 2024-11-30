import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const userId = body.userId;

  try {
    // Kullanıcının mevcut kredilerini kontrol et
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credit: true },
    });

    if (!user || user.credit <= 0) {
      return new Response(
        JSON.stringify({
          message: "Insufficient credits",
        }),
        { status: 403 }
      );
    }

    // Krediyi azalt ve güncellenmiş kullanıcıyı döndür
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        credit: {
          decrement: 1,
        },
      },
      select: { credit: true },
    });

    return new Response(
      JSON.stringify({
        message: "Credit used successfully",
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
