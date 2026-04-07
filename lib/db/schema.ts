import { pgTable, text, timestamp, uuid, primaryKey, integer, numeric, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Shared audit columns ─────────────────────────────────────────────────────
const timestamps = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
  deletedAt: timestamp('deleted_at'), // null until soft-deleted
};

// ─── 1. Permission Groups ──────────────────────────────────────────────────────
export const permissionGroups = pgTable('permission_groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  ...timestamps,
});

// ─── 2. Permissions ───────────────────────────────────────────────────────────
export const permissions = pgTable('permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(), // e.g. 'users.create'
  description: text('description'),
  groupId: uuid('group_id')
    .notNull()
    .references(() => permissionGroups.id, { onDelete: 'cascade' }),
  ...timestamps,
});

// ─── 3. Roles ─────────────────────────────────────────────────────────────────
export const roles = pgTable('roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  ...timestamps,
});

// ─── 4. Role-Permissions (many-to-many) ──────────────────────────────────────
export const rolePermissions = pgTable('role_permissions', {
  roleId: uuid('role_id')
    .notNull()
    .references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: uuid('permission_id')
    .notNull()
    .references(() => permissions.id, { onDelete: 'cascade' }),
  ...timestamps,
}, (table) => [
  primaryKey({ columns: [table.roleId, table.permissionId] }),
]);

// ─── 5. Organization Types ────────────────────────────────────────────────────
export const organizationTypes = pgTable('organization_types', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  ...timestamps,
});

// ─── 6. Organizations ─────────────────────────────────────────────────────────
export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  organizationTypeId: uuid('organization_type_id')
    .notNull()
    .references(() => organizationTypes.id, { onDelete: 'restrict' }),
  location: text('location'),
  contact: text('contact'),
  currency: text('currency').default('USD').notNull(),
  currencyDisplay: text('currency_display').default('symbol').notNull(),
  ...timestamps,
});

// ─── 7. Users ─────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  loginAt: timestamp('login_at'),
  roleId: uuid('role_id')
    .notNull()
    .references(() => roles.id, { onDelete: 'restrict' }),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'restrict' }),
  ...timestamps,
});

// ─── 8. Password Resets (OTP) ─────────────────────────────────────────────────
export const passwordResets = pgTable('password_resets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  otp: text('otp').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  ...timestamps,
});

// ─── 9. Departments ───────────────────────────────────────────────────────────
export const departments = pgTable('departments', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  ...timestamps,
});

// ─── 10. Inventory Items ──────────────────────────────────────────────────────
export const inventoryItems = pgTable('inventory_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  sku: text('sku').notNull(), // not unique — same SKU may appear in different orgs
  departmentId: uuid('department_id')
    .notNull()
    .references(() => departments.id, { onDelete: 'restrict' }),
  qty: integer('qty').notNull().default(0),
  unit: text('unit').notNull().default('pcs'),
  icon: text('icon').notNull().default('📦'),
  minQty: integer('min_qty').notNull().default(10), // threshold for Low/Critical status
  description: text('description'), // rich spec for supplier RFQ portal
  ...timestamps,
});

// ─── 11. Production Plans ─────────────────────────────────────────────────────
export const productionPlans = pgTable('production_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  dishName: text('dish_name').notNull(),
  targetServings: integer('target_servings').notNull().default(1),
  estimatedStartTime: text('estimated_start_time'),
  status: text('status').notNull().default('Planned'), // Planned | In Prep | Cooked | Completed
  deductedAt: timestamp('deducted_at'),               // set when stock is deducted
  ...timestamps,
});

// ─── 12. Production Plan Ingredients ─────────────────────────────────────────
export const productionPlanIngredients = pgTable('production_plan_ingredients', {
  id: uuid('id').defaultRandom().primaryKey(),
  productionPlanId: uuid('production_plan_id')
    .notNull()
    .references(() => productionPlans.id, { onDelete: 'cascade' }),
  inventoryItemId: uuid('inventory_item_id')
    .notNull()
    .references(() => inventoryItems.id, { onDelete: 'restrict' }),
  qty: integer('qty').notNull().default(1),
  ...timestamps,
});

// ─── 13. Special Orders ───────────────────────────────────────────────────────
export const specialOrders = pgTable('special_orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  requestName: text('request_name').notNull(),
  preparationNotes: text('preparation_notes'),
  priorityLevel: text('priority_level').notNull().default('Normal'), // Normal | High | Critical
  logTime: text('log_time'),                                          // time string from client
  status: text('status').notNull().default('Pending'),                // Pending | Cooked
  ...timestamps,
});

// ─── 11. Stock Usages (header) ────────────────────────────────────────────────
export const stockUsages = pgTable('stock_usages', {
  id: uuid('id').defaultRandom().primaryKey(),
  date: text('date').notNull(),                       // ISO date e.g. '2026-03-23'
  reason: text('reason').notNull(),                   // 'Waste' | 'Consumption' | 'Theft' | 'Other'
  notes: text('notes'),
  recordedById: uuid('recorded_by_id')
    .references(() => users.id, { onDelete: 'set null' }),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  ...timestamps,
});

// ─── 12. Stock Usage Items (lines) ────────────────────────────────────────────
export const stockUsageItems = pgTable('stock_usage_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  stockUsageId: uuid('stock_usage_id')
    .notNull()
    .references(() => stockUsages.id, { onDelete: 'cascade' }),
  inventoryItemId: uuid('inventory_item_id')
    .notNull()
    .references(() => inventoryItems.id, { onDelete: 'restrict' }),
  qtyUsed: numeric('qty_used', { precision: 10, scale: 3 }).notNull(), // supports decimal units (kg, l, etc.)
  ...timestamps,
});

// ─── 14. Budgets (procurement) ────────────────────────────────────────────────
export const budgets = pgTable('budgets', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  departmentId: uuid('department_id')
    .notNull()
    .references(() => departments.id, { onDelete: 'restrict' }),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  fiscalYear: text('fiscal_year').notNull(),
  allocatedAmount: numeric('allocated_amount', { precision: 12, scale: 2 }).notNull(),
  notes: text('notes'),
  ...timestamps,
});

// ─── 15. Requisitions ─────────────────────────────────────────────────────────
export const requisitions = pgTable('requisitions', {
  id: uuid('id').defaultRandom().primaryKey(),
  requisitionNumber: text('requisition_number').notNull().unique(),
  requestedById: uuid('requested_by_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  departmentId: uuid('department_id')
    .notNull()
    .references(() => departments.id, { onDelete: 'restrict' }),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  budgetId: uuid('budget_id').references(() => budgets.id, { onDelete: 'set null' }),
  fiscalYear: text('fiscal_year'),
  priority: text('priority').notNull().default('Normal'),
  deliveryDate: text('delivery_date'),
  reason: text('reason'),
  status: text('status').notNull().default('pending'),
  estimatedTotal: numeric('estimated_total', { precision: 12, scale: 2 }).default('0'),
  ...timestamps,
});

// ─── 16. Requisition line items ───────────────────────────────────────────────
export const requisitionItems = pgTable('requisition_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  requisitionId: uuid('requisition_id')
    .notNull()
    .references(() => requisitions.id, { onDelete: 'cascade' }),
  inventoryItemId: uuid('inventory_item_id')
    .notNull()
    .references(() => inventoryItems.id, { onDelete: 'restrict' }),
  qty: integer('qty').notNull(),
  estimatedUnitPrice: numeric('estimated_unit_price', { precision: 10, scale: 2 }),
  ...timestamps,
});

// ─── 17. Suppliers (procurement) ──────────────────────────────────────────────
export const suppliers = pgTable('suppliers', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  category: text('category').notNull(),
  contactPerson: text('contact_person'),
  email: text('email'),
  phone: text('phone'),
  website: text('website'),
  vatNumber: text('vat_number'),
  paymentTerms: text('payment_terms'),
  streetAddress: text('street_address'),
  status: text('status').notNull().default('Active'),
  rating: numeric('rating', { precision: 3, scale: 1 }).default('0'),
  reliability: integer('reliability').default(0),
  ...timestamps,
});

// ─── 18. RFQs (sourcing) ──────────────────────────────────────────────────────
export const rfqs = pgTable('rfqs', {
  id: uuid('id').defaultRandom().primaryKey(),
  rfqNumber: text('rfq_number').notNull().unique(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  createdById: uuid('created_by_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  requisitionId: uuid('requisition_id')
    .notNull()
    .references(() => requisitions.id, { onDelete: 'restrict' }),
  title: text('title').notNull(),
  category: text('category'),
  paymentTerms: text('payment_terms'),
  requiredDelivery: text('required_delivery'),
  deadline: text('deadline'),
  status: text('status').notNull().default('draft'),
  description: text('description'),
  terms: text('terms'),
  ...timestamps,
});

// ─── 19. RFQ ↔ Supplier junction ──────────────────────────────────────────────
export const rfqSuppliers = pgTable(
  'rfq_suppliers',
  {
    rfqId: uuid('rfq_id')
      .notNull()
      .references(() => rfqs.id, { onDelete: 'cascade' }),
    supplierId: uuid('supplier_id')
      .notNull()
      .references(() => suppliers.id, { onDelete: 'cascade' }),
    ...timestamps,
  },
  (t) => [primaryKey({ columns: [t.rfqId, t.supplierId] })],
);

// ─── 20. RFQ supplier portal tokens (one row per RFQ × supplier) ──────────────
export const rfqSupplierTokens = pgTable(
  'rfq_supplier_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    rfqId: uuid('rfq_id')
      .notNull()
      .references(() => rfqs.id, { onDelete: 'cascade' }),
    supplierId: uuid('supplier_id')
      .notNull()
      .references(() => suppliers.id, { onDelete: 'cascade' }),
    token: uuid('token').defaultRandom().notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    sentAt: timestamp('sent_at'),
    usedAt: timestamp('used_at'),
    ...timestamps,
  },
  (t) => [unique().on(t.rfqId, t.supplierId)],
);

// ─── 21. RFQ quotations (supplier submissions) ─────────────────────────────────
export const rfqQuotations = pgTable('rfq_quotations', {
  id: uuid('id').defaultRandom().primaryKey(),
  rfqId: uuid('rfq_id')
    .notNull()
    .references(() => rfqs.id, { onDelete: 'cascade' }),
  supplierId: uuid('supplier_id')
    .notNull()
    .references(() => suppliers.id, { onDelete: 'cascade' }),
  tokenId: uuid('token_id')
    .notNull()
    .unique()
    .references(() => rfqSupplierTokens.id, { onDelete: 'restrict' }),
  currency: text('currency').notNull().default('USD'),
  validityDate: text('validity_date').notNull(),
  paymentTerms: text('payment_terms').notNull(),
  incoterms: text('incoterms').notNull(),
  notes: text('notes'),
  totalAmount: numeric('total_amount', { precision: 14, scale: 2 }),
  status: text('status').notNull().default('submitted'),
  submittedAt: timestamp('submitted_at'),
  ...timestamps,
});

// ─── 22. RFQ quotation line items ─────────────────────────────────────────────
export const rfqQuotationItems = pgTable('rfq_quotation_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  quotationId: uuid('quotation_id')
    .notNull()
    .references(() => rfqQuotations.id, { onDelete: 'cascade' }),
  requisitionItemId: uuid('requisition_item_id')
    .notNull()
    .references(() => requisitionItems.id, { onDelete: 'restrict' }),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
  leadTime: text('lead_time').notNull(),
  remarks: text('remarks'),
  ...timestamps,
});

// ─── 23. RFQ quotation attachments (supplier uploads) ───────────────────────
export const rfqQuotationAttachments = pgTable('rfq_quotation_attachments', {
  id: uuid('id').defaultRandom().primaryKey(),
  quotationId: uuid('quotation_id')
    .notNull()
    .references(() => rfqQuotations.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: text('file_size'),
  ...timestamps,
});

// ─── Relations ────────────────────────────────────────────────────────────────
export const permissionGroupsRelations = relations(permissionGroups, ({ many }) => ({
  permissions: many(permissions),
}));

export const permissionsRelations = relations(permissions, ({ one, many }) => ({
  group: one(permissionGroups, {
    fields: [permissions.groupId],
    references: [permissionGroups.id],
  }),
  rolePermissions: many(rolePermissions),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  rolePermissions: many(rolePermissions),
  users: many(users),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  requisitionsRequested: many(requisitions),
  rfqs: many(rfqs),
}));

export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  organizationType: one(organizationTypes, {
    fields: [organizations.organizationTypeId],
    references: [organizationTypes.id],
  }),
  users: many(users),
  departments: many(departments),
  budgets: many(budgets),
  requisitions: many(requisitions),
  suppliers: many(suppliers),
  rfqs: many(rfqs),
}));

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [departments.organizationId],
    references: [organizations.id],
  }),
  inventoryItems: many(inventoryItems),
  budgets: many(budgets),
  requisitions: many(requisitions),
}));

export const inventoryItemsRelations = relations(inventoryItems, ({ one, many }) => ({
  department: one(departments, {
    fields: [inventoryItems.departmentId],
    references: [departments.id],
  }),
  stockUsageItems: many(stockUsageItems),
  productionPlanIngredients: many(productionPlanIngredients),
  requisitionItems: many(requisitionItems),
}));

export const productionPlansRelations = relations(productionPlans, ({ many }) => ({
  ingredients: many(productionPlanIngredients),
}));

export const productionPlanIngredientsRelations = relations(productionPlanIngredients, ({ one }) => ({
  productionPlan: one(productionPlans, {
    fields: [productionPlanIngredients.productionPlanId],
    references: [productionPlans.id],
  }),
  inventoryItem: one(inventoryItems, {
    fields: [productionPlanIngredients.inventoryItemId],
    references: [inventoryItems.id],
  }),
}));

export const stockUsagesRelations = relations(stockUsages, ({ one, many }) => ({
  recordedBy: one(users, {
    fields: [stockUsages.recordedById],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [stockUsages.organizationId],
    references: [organizations.id],
  }),
  items: many(stockUsageItems),
}));

export const stockUsageItemsRelations = relations(stockUsageItems, ({ one }) => ({
  stockUsage: one(stockUsages, {
    fields: [stockUsageItems.stockUsageId],
    references: [stockUsages.id],
  }),
  inventoryItem: one(inventoryItems, {
    fields: [stockUsageItems.inventoryItemId],
    references: [inventoryItems.id],
  }),
}));

export const budgetsRelations = relations(budgets, ({ one, many }) => ({
  department: one(departments, {
    fields: [budgets.departmentId],
    references: [departments.id],
  }),
  organization: one(organizations, {
    fields: [budgets.organizationId],
    references: [organizations.id],
  }),
  requisitions: many(requisitions),
}));

export const requisitionsRelations = relations(requisitions, ({ one, many }) => ({
  requestedBy: one(users, {
    fields: [requisitions.requestedById],
    references: [users.id],
  }),
  department: one(departments, {
    fields: [requisitions.departmentId],
    references: [departments.id],
  }),
  organization: one(organizations, {
    fields: [requisitions.organizationId],
    references: [organizations.id],
  }),
  budget: one(budgets, {
    fields: [requisitions.budgetId],
    references: [budgets.id],
  }),
  items: many(requisitionItems),
  rfqs: many(rfqs),
}));

export const requisitionItemsRelations = relations(requisitionItems, ({ one, many }) => ({
  requisition: one(requisitions, {
    fields: [requisitionItems.requisitionId],
    references: [requisitions.id],
  }),
  inventoryItem: one(inventoryItems, {
    fields: [requisitionItems.inventoryItemId],
    references: [inventoryItems.id],
  }),
  rfqQuotationItems: many(rfqQuotationItems),
}));

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [suppliers.organizationId],
    references: [organizations.id],
  }),
  rfqSuppliers: many(rfqSuppliers),
  rfqSupplierTokens: many(rfqSupplierTokens),
  rfqQuotations: many(rfqQuotations),
}));

export const rfqsRelations = relations(rfqs, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [rfqs.organizationId],
    references: [organizations.id],
  }),
  createdBy: one(users, {
    fields: [rfqs.createdById],
    references: [users.id],
  }),
  requisition: one(requisitions, {
    fields: [rfqs.requisitionId],
    references: [requisitions.id],
  }),
  rfqSuppliers: many(rfqSuppliers),
  supplierTokens: many(rfqSupplierTokens),
  quotations: many(rfqQuotations),
}));

export const rfqSuppliersRelations = relations(rfqSuppliers, ({ one }) => ({
  rfq: one(rfqs, {
    fields: [rfqSuppliers.rfqId],
    references: [rfqs.id],
  }),
  supplier: one(suppliers, {
    fields: [rfqSuppliers.supplierId],
    references: [suppliers.id],
  }),
}));

export const rfqSupplierTokensRelations = relations(rfqSupplierTokens, ({ one }) => ({
  rfq: one(rfqs, {
    fields: [rfqSupplierTokens.rfqId],
    references: [rfqs.id],
  }),
  supplier: one(suppliers, {
    fields: [rfqSupplierTokens.supplierId],
    references: [suppliers.id],
  }),
  quotation: one(rfqQuotations, {
    fields: [rfqSupplierTokens.id],
    references: [rfqQuotations.tokenId],
  }),
}));

export const rfqQuotationsRelations = relations(rfqQuotations, ({ one, many }) => ({
  rfq: one(rfqs, {
    fields: [rfqQuotations.rfqId],
    references: [rfqs.id],
  }),
  supplier: one(suppliers, {
    fields: [rfqQuotations.supplierId],
    references: [suppliers.id],
  }),
  token: one(rfqSupplierTokens, {
    fields: [rfqQuotations.tokenId],
    references: [rfqSupplierTokens.id],
  }),
  items: many(rfqQuotationItems),
  attachments: many(rfqQuotationAttachments),
}));

export const rfqQuotationItemsRelations = relations(rfqQuotationItems, ({ one }) => ({
  quotation: one(rfqQuotations, {
    fields: [rfqQuotationItems.quotationId],
    references: [rfqQuotations.id],
  }),
  requisitionItem: one(requisitionItems, {
    fields: [rfqQuotationItems.requisitionItemId],
    references: [requisitionItems.id],
  }),
}));

export const rfqQuotationAttachmentsRelations = relations(rfqQuotationAttachments, ({ one }) => ({
  quotation: one(rfqQuotations, {
    fields: [rfqQuotationAttachments.quotationId],
    references: [rfqQuotations.id],
  }),
}));
