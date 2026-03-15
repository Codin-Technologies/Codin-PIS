import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, passwordResets } from "@/lib/db/schema";
import { eq, and, isNull, gt } from "drizzle-orm";

export async function verifyOtp(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      return NextResponse.json(
        { message: "Invalid OTP or expired" },
        { status: 400 }
      );
    }

    const [resetRecord] = await db
      .select()
      .from(passwordResets)
      .where(
        and(
          eq(passwordResets.userId, user.id),
          eq(passwordResets.otp, otp),
          isNull(passwordResets.usedAt),
          gt(passwordResets.expiresAt, new Date())
        )
      );

    if (!resetRecord) {
      return NextResponse.json(
        { message: "Invalid OTP or expired" },
        { status: 400 }
      );
    }

    await db
      .update(passwordResets)
      .set({ usedAt: new Date() })
      .where(eq(passwordResets.id, resetRecord.id));

    return NextResponse.json(
      { message: "OTP verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
