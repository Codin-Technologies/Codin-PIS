import bcrypt from "bcrypt";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function verifyUserCredentials(email: string, password?: string) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (!user || !user.passwordHash) {
    throw new Error("Invalid credentials");
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  // Update login timestamp
  await db
    .update(users)
    .set({ loginAt: new Date() })
    .where(eq(users.id, user.id));

  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
