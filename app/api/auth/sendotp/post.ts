import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, passwordResets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendOtpEmail } from "@/lib/mail";

export async function sendOtp(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      // Don't leak if user exists, just say sent
      return NextResponse.json(
        { message: "If an account with that email exists, an OTP has been sent." },
        { status: 200 }
      );
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Expires in 3 minutes
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

    // Save to DB
    await db.insert(passwordResets).values({
      userId: user.id,
      otp,
      expiresAt,
    });

    // Send Email
    await sendOtpEmail({
      to: email,
      otp,
      userName: user.fullName || "User",
    });

    return NextResponse.json(
      { message: "OTP sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
