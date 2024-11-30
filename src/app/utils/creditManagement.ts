import prisma from "@/lib/prisma";

export async function addUserCredit(userId: string, amount: number = 1) {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        credit: {
          increment: amount,
        },
      },
      select: {
        credit: true,
      },
    });

    return {
      success: true,
      data: updatedUser,
      error: null,
    };
  } catch (error) {
    console.error("Credit update error:", error);
    return {
      success: false,
      data: null,
      error: "Failed to update user credit",
    };
  }
}
