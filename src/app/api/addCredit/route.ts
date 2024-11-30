import { NextRequest } from "next/server";
import { addUserCredit } from "@/app/utils/creditManagement";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId;
    const requestedCredit = body.requestedCredit || 1;

    const result = await addUserCredit(userId, requestedCredit);

    if (!result.success) {
      return new Response(JSON.stringify({ message: result.error }), {
        status: 500,
      });
    }

    return new Response(
      JSON.stringify({
        message: "Credit added successfully",
        newCreditTotal: result?.data?.credit,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
