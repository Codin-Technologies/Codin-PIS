import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { permissions } from '@/lib/db/schema';

export async function postPermission(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, groupId } = body;

    if (!name || !groupId) {
      return NextResponse.json({ message: 'Name and groupId are required' }, { status: 400 });
    }

    const [permission] = await db.insert(permissions).values({ name, description, groupId }).returning();
    return NextResponse.json({ data: permission, message: 'Permission created successfully' }, { status: 201 });
  } catch (err) {
    console.error('[postPermission]', err);
    return NextResponse.json({ message: 'Error creating permission' }, { status: 500 });
  }
}
