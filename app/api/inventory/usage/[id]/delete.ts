import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stockUsages } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

export async function deleteStockUsage(req: NextRequest, id: string) {
  try {
    const existing = await db.query.stockUsages.findFirst({
      where: and(eq(stockUsages.id, id), isNull(stockUsages.deletedAt)),
    });

    if (!existing) {
      return NextResponse.json({ message: 'Stock usage record not found' }, { status: 404 });
    }

    await db
      .update(stockUsages)
      .set({ deletedAt: new Date() })
      .where(eq(stockUsages.id, id));

    return NextResponse.json(
      { message: 'Stock usage record deleted successfully. Note: inventory quantities are NOT reversed.' },
      { status: 200 }
    );
  } catch (err) {
    console.error('[deleteStockUsage]', err);
    return NextResponse.json({ message: 'Error deleting stock usage record' }, { status: 500 });
  }
}
