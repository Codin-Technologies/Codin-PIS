import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { specialOrders } from '@/lib/db/schema';

export async function postSpecialOrder(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestName, preparationNotes, priorityLevel, logTime } = body;

    if (!requestName) {
      return NextResponse.json({ message: 'requestName is required' }, { status: 400 });
    }

    const [newOrder] = await db
      .insert(specialOrders)
      .values({
        requestName,
        preparationNotes,
        priorityLevel: priorityLevel ?? 'Normal',
        logTime,
        status: 'Pending',
      })
      .returning();

    return NextResponse.json({ data: newOrder, message: 'Special order created successfully' }, { status: 201 });
  } catch (err) {
    console.error('[postSpecialOrder]', err);
    return NextResponse.json({ message: 'Error creating special order' }, { status: 500 });
  }
}
