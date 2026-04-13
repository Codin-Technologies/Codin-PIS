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
  } catch (error: any) {
    console.error("Login error:", error);
    
    if (error.message === "Email and password are required") {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    
    if (error.message === "Invalid credentials") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
