import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function getRoles() {
  try {
    const allRoles = await db.query.roles.findMany({
      with: {
        rolePermissions: {
          with: {
            permission: true
          }
        },
        users: true
      }
    });

    // Map output to include flattened permissions array and users count
    // to match UI expectations in CreateRoleForm and Role lists.
    const formattedRoles = allRoles.map(role => ({
      ...role,
      permissionsCount: role.rolePermissions.length,
      usersCount: role.users.length,
      permissions: role.rolePermissions.map(rp => rp.permission),
      rolePermissions: undefined, // remove bloated relationship array
      users: undefined, // remove bloated users array
    }));

    return NextResponse.json(formattedRoles, { status: 200 });
  } catch (err) {
    console.error('[getRoles]', err);
    return NextResponse.json({ message: 'Error fetching roles' }, { status: 500 });
  }
}
