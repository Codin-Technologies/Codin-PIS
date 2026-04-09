import { NextRequest, NextResponse } from "next/server";
import { verifyUserCredentials } from "@/lib/auth";

export async function loginUser(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const user = await verifyUserCredentials(username, password);

    return NextResponse.json(
      { message: "Login successful", user },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Login error:", error);
    
    const message = error instanceof Error ? error.message : "Internal server error";

    if (message === "Email and password are required") {
      return NextResponse.json({ message }, { status: 400 });
    }
    
    if (message === "Invalid credentials") {
      return NextResponse.json({ message }, { status: 401 });
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
