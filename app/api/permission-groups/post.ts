import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { permissionGroups } from '@/lib/db/schema';

export async function postPermissionGroup(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    const [group] = await db.insert(permissionGroups).values({ name, description }).returning();
    return NextResponse.json({ data: group, message: 'Permission group created successfully' }, { status: 201 });
  } catch (err) {
    console.error('[postPermissionGroup]', err);
    return NextResponse.json({ message: 'Error creating permission group' }, { status: 500 });
  }
}
