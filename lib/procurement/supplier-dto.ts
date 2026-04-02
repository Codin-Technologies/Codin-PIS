import type { suppliers } from '@/lib/db/schema';
import type { InferSelectModel } from 'drizzle-orm';

export type SupplierRow = InferSelectModel<typeof suppliers>;

export type SupplierStatus = 'Active' | 'Inactive' | 'Under Review';

/** API shape used by the supplier directory UI */
export function supplierToDto(row: SupplierRow) {
  const status = (row.status ?? 'Active') as SupplierStatus;
  return {
    id: row.id,
    branchId: row.organizationId,
    organizationId: row.organizationId,
    name: row.name,
    category: row.category,
    contactPerson: row.contactPerson,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    website: row.website ?? undefined,
    vatNumber: row.vatNumber ?? undefined,
    paymentTerms: row.paymentTerms ?? undefined,
    streetAddress: row.streetAddress ?? undefined,
    rating: Number(row.rating ?? 0),
    location: row.streetAddress?.trim() ? row.streetAddress : '—',
    status,
    reliability: row.reliability ?? 0,
    spend: 0,
    contacts: row.contactPerson?.trim() ? row.contactPerson : '—',
    tags: [] as string[],
  };
}
