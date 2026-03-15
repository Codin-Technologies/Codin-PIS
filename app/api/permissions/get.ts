import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function getPermissions() {
  try {
    const groups = await db.query.permissionGroups.findMany({
      with: {
        permissions: true
      }
    });
    
    // The UI expects an array of modules, each with features and access/create/update/delete flags.
    // However, for this core API, returning the raw relational data grouped by module is usually best,
    // and the frontend mapping logic can normalize it into the exact state structure for the form.
    return NextResponse.json(groups, { status: 200 });
  } catch (err) {
    console.error('[getPermissions]', err);
    return NextResponse.json({ message: 'Error fetching permissions' }, { status: 500 });
  }
}
