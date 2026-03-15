import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { roles, rolePermissions } from '@/lib/db/schema';

export async function postRole(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, permissions } = body;

    if (!name) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    const result = await db.transaction(async (tx) => {
      // 1. Create the role
      const [role] = await tx.insert(roles).values({ name, description }).returning();

      // 2. Insert assigned permissions if strictly provided
      if (Array.isArray(permissions) && permissions.length > 0) {
        const rolePermsToInsert = permissions.map((permId: string) => ({
          roleId: role.id,
          permissionId: permId,
        }));
        await tx.insert(rolePermissions).values(rolePermsToInsert);
      }

      return role;
    });

    return NextResponse.json({ data: result, message: 'Role created successfully' }, { status: 201 });
  } catch (err) {
    console.error('[postRole]', err);
    return NextResponse.json({ message: 'Error creating role' }, { status: 500 });
  }
}
