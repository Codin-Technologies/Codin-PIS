import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AuthenticatedUser } from '@/lib/auth/utils';

export async function getSpecialOrders(req: NextRequest, user: AuthenticatedUser) {
  try {
    const orders = await db.query.specialOrders.findMany({
      // TODO: Backend dev MUST add organizationId to specialOrders table and filter here:
      // where: (orders, { eq }) => eq(orders.organizationId, user.organizationId),
      orderBy: (specialOrders, { desc }) => [desc(specialOrders.priorityLevel), desc(specialOrders.createdAt)],
    });

    return NextResponse.json({ data: orders, message: 'Special orders fetched successfully' }, { status: 200 });
  } catch (err) {
    console.error('[getSpecialOrders]', err);
    return NextResponse.json({ message: 'Error fetching special orders' }, { status: 500 });
  }
}
