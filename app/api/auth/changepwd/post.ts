import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { comparePassword, hashPassword } from "@/lib/auth";

export async function changePassword(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, oldPassword, newPassword } = body;

    if (!id || !oldPassword || !newPassword) {
      return NextResponse.json(
        { message: "User ID, old password, and new password are required" },
        { status: 400 }
      );
    }

    const [user] = await db.select().from(users).where(eq(users.id, id));

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { message: "User not found or invalid credentials" },
        { status: 404 }
      );
    }

    const isValid = await comparePassword(oldPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid old password" },
        { status: 401 }
      );
    }

    const newPasswordHash = await hashPassword(newPassword);

    await db
      .update(users)
      .set({ passwordHash: newPasswordHash })
      .where(eq(users.id, id));

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
