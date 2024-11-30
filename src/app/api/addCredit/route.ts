import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
