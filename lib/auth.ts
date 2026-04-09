import bcrypt from "bcrypt";
import { db } from "./db";
import { users } from "./db/schema";
import { and, eq, isNull } from "drizzle-orm";

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
    .where(and(eq(users.email, email), isNull(users.deletedAt)));

  if (!user || !user.passwordHash) {
    throw new Error("Invalid credentials");
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  const previousLoginAt = user.loginAt;
  const currentLoginAt = new Date();

  // Update login timestamp
  await db
    .update(users)
    .set({ loginAt: currentLoginAt })
    .where(eq(users.id, user.id));

  const { passwordHash, ...userWithoutPassword } = user;
  return {
    ...userWithoutPassword,
    loginAt: currentLoginAt,
    lastLoginAt: previousLoginAt,
    mustChangePassword: previousLoginAt == null,
  };
}
