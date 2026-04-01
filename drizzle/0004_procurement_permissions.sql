-- Procurement permission groups (skip if names already exist)
INSERT INTO "permission_groups" ("id", "name", "description", "created_at")
VALUES
  ('11111111-1111-4111-8111-111111111101', 'requisitions', 'Procurement — requisitions', now()),
  ('11111111-1111-4111-8111-111111111102', 'budgets', 'Procurement — budgets', now())
ON CONFLICT ("name") DO NOTHING;
--> statement-breakpoint
-- Requisitions permissions
INSERT INTO "permissions" ("name", "description", "group_id", "created_at")
SELECT v.name, v.description, g.id, now()
FROM "permission_groups" g
CROSS JOIN (VALUES
  ('requisitions.read', 'List and view requisitions'),
  ('requisitions.create', 'Create requisitions'),
  ('requisitions.update', 'Update requisition status')
) AS v(name, description)
WHERE g.name = 'requisitions'
ON CONFLICT ("name") DO NOTHING;
--> statement-breakpoint
-- Budgets permissions
INSERT INTO "permissions" ("name", "description", "group_id", "created_at")
SELECT v.name, v.description, g.id, now()
FROM "permission_groups" g
CROSS JOIN (VALUES
  ('budgets.read', 'List and view budgets'),
  ('budgets.create', 'Create budgets'),
  ('budgets.update', 'Update budgets'),
  ('budgets.delete', 'Delete budgets')
) AS v(name, description)
WHERE g.name = 'budgets'
ON CONFLICT ("name") DO NOTHING;
--> statement-breakpoint
-- Assign all seven permissions to the target role
INSERT INTO "role_permissions" ("role_id", "permission_id", "created_at")
SELECT '3346801f-45dc-4d40-b369-b6bef161de2d'::uuid, p.id, now()
FROM "permissions" p
WHERE p.name IN (
  'requisitions.read',
  'requisitions.create',
  'requisitions.update',
  'budgets.read',
  'budgets.create',
  'budgets.update',
  'budgets.delete'
)
ON CONFLICT ("role_id", "permission_id") DO NOTHING;
