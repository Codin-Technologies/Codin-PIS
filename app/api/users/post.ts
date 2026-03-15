import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { hashPassword } from '@/lib/auth';

export async function postUser(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, roleId, organizationId, password } = body;

    if (!fullName || !email || !roleId || !organizationId) {
      return NextResponse.json(
        { message: 'fullName, email, roleId, and organizationId are required' },
        { status: 400 }
      );
    }

    // TODO: Replace with a proper bcrypt / argon2 hash before production
    const passwordHash = await hashPassword(password);

    const [user] = await db.insert(users).values({ fullName, email, roleId, organizationId, passwordHash }).returning();
    return NextResponse.json({ data: user, message: 'User created successfully' }, { status: 201 });
  } catch (err) {
    console.error('[postUser]', err);
    return NextResponse.json({ message: 'Error creating user' }, { status: 500 });
  }
}
