import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function getPermissionGroups() {
  try {
    const allGroups = await db.query.permissionGroups.findMany();
    return NextResponse.json(allGroups, { status: 200 });
  } catch (err) {
    console.error('[getPermissionGroups]', err);
    return NextResponse.json({ message: 'Error fetching permission groups' }, { status: 500 });
  }
}
