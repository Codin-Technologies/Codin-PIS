import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { hashPassword } from '@/lib/auth';
import { AuthenticatedUser } from '@/lib/auth/utils';

export async function postUser(req: NextRequest, sessionUser: AuthenticatedUser) {
  try {
    const body = await req.json();
    const { fullName, email, roleId, password } = body;

    if (!fullName || !email || !roleId) {
      return NextResponse.json(
        { message: 'fullName, email, and roleId are required' },
        { status: 400 }
      );
    }

    const organizationId = sessionUser.organizationId;
    if (!organizationId) {
      return NextResponse.json({ message: 'Organization context missing' }, { status: 400 });
    }

    // TODO: Replace with a proper bcrypt / argon2 hash before production
    const passwordHash = await hashPassword(password);

    const [newUser] = await db.insert(users).values({ 
      fullName, 
      email, 
      roleId, 
      organizationId, 
      passwordHash 
    }).returning();

    return NextResponse.json({ data: newUser, message: 'User created successfully' }, { status: 201 });
  } catch (err) {
    console.error('[postUser]', err);
    return NextResponse.json({ message: 'Error creating user' }, { status: 500 });
  }
}
