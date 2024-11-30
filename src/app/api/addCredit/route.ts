import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Input validation
    const userId = body.userId;
    if (!userId) {
      return new Response(JSON.stringify({ message: "User ID is required" }), {
        status: 400,
      });
    }

    const requestedCredit = Number(body.requestedCredit) || 1;
    if (isNaN(requestedCredit)) {
      return new Response(
        JSON.stringify({ message: "Invalid credit amount" }),
        { status: 400 }
      );
    }

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
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Error processing request:", error);

    // Check for specific Prisma errors
    if (error.code === "P2025") {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
