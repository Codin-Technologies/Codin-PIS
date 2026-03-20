import { pgTable, text, timestamp, uuid, primaryKey, integer } from 'drizzle-orm/pg-core';
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

export const usersRelations = relations(users, ({ one }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
}));

export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  organizationType: one(organizationTypes, {
    fields: [organizations.organizationTypeId],
    references: [organizationTypes.id],
  }),
  users: many(users),
  departments: many(departments),
}));

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [departments.organizationId],
    references: [organizations.id],
  }),
  inventoryItems: many(inventoryItems),
}));

export const inventoryItemsRelations = relations(inventoryItems, ({ one }) => ({
  department: one(departments, {
    fields: [inventoryItems.departmentId],
    references: [departments.id],
  }),
}));
