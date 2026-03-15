import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function getUsers() {
  try {
    const allUsers = await db.query.users.findMany();
    // Strip passwordHash from every user before responding
    const safeUsers = allUsers.map(({ passwordHash, ...rest }) => rest);
    return NextResponse.json({ data: safeUsers, message: 'Users fetched successfully' }, { status: 200 });
  } catch (err) {
    console.error('[getUsers]', err);
    return NextResponse.json({ message: 'Error fetching users' }, { status: 500 });
  }
}
