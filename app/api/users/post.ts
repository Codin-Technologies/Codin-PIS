import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { hashPassword } from '@/lib/auth';
import { AuthenticatedUser } from '@/lib/auth/utils';
import { sendWelcomeUserEmail } from '@/lib/mail';
import { getPublicSiteUrl } from '@/lib/get-base-url';

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

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { message: 'password is required and must be at least 8 characters' },
        { status: 400 }
      );
    }

    const organizationId = sessionUser.organizationId;
    if (!organizationId) {
      return NextResponse.json({ message: 'Organization context missing' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const [newUser] = await db.insert(users).values({
      fullName,
      email,
      roleId,
      organizationId,
      passwordHash,
    }).returning();

    let welcomeEmailSent = false;
    try {
      if (process.env.RESEND_API_KEY) {
        await sendWelcomeUserEmail({
          to: email,
          fullName,
          username: email,
          password,
          appUrl: getPublicSiteUrl(),
        });
        welcomeEmailSent = true;
      } else {
        console.warn('[postUser] RESEND_API_KEY not set; skipping welcome email');
      }
    } catch (mailErr) {
      console.error('[postUser] Welcome email failed:', mailErr);
    }

    const { passwordHash: _omitHash, ...safeUser } = newUser;
    void _omitHash;
    return NextResponse.json(
      {
        data: safeUser,
        message: 'User created successfully',
        welcomeEmailSent,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[postUser]', err);
    return NextResponse.json({ message: 'Error creating user' }, { status: 500 });
  }
}
