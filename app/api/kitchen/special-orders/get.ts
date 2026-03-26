import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function getSpecialOrders() {
  try {
    const orders = await db.query.specialOrders.findMany({
      orderBy: (specialOrders, { desc }) => [desc(specialOrders.priorityLevel), desc(specialOrders.createdAt)],
    });

    return NextResponse.json({ data: orders, message: 'Special orders fetched successfully' }, { status: 200 });
  } catch (err) {
    console.error('[getSpecialOrders]', err);
    return NextResponse.json({ message: 'Error fetching special orders' }, { status: 500 });
  }
}
