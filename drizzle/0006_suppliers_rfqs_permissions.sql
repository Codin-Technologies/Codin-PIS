-- Suppliers & RFQs permission groups
INSERT INTO "permission_groups" ("id", "name", "description", "created_at")
VALUES
  ('11111111-1111-4111-8111-111111111103', 'suppliers', 'Procurement — suppliers', now()),
  ('11111111-1111-4111-8111-111111111104', 'rfqs', 'Procurement — RFQs', now())
ON CONFLICT ("name") DO NOTHING;
--> statement-breakpoint
INSERT INTO "permissions" ("name", "description", "group_id", "created_at")
SELECT v.name, v.description, g.id, now()
FROM "permission_groups" g
CROSS JOIN (VALUES
  ('suppliers.read', 'List and view suppliers'),
  ('suppliers.create', 'Create suppliers'),
  ('suppliers.update', 'Update suppliers'),
  ('suppliers.delete', 'Delete suppliers')
) AS v(name, description)
WHERE g.name = 'suppliers'
ON CONFLICT ("name") DO NOTHING;
--> statement-breakpoint
INSERT INTO "permissions" ("name", "description", "group_id", "created_at")
SELECT v.name, v.description, g.id, now()
FROM "permission_groups" g
CROSS JOIN (VALUES
  ('rfqs.read', 'List and view RFQs'),
  ('rfqs.create', 'Create RFQs'),
  ('rfqs.update', 'Update RFQ status')
) AS v(name, description)
WHERE g.name = 'rfqs'
ON CONFLICT ("name") DO NOTHING;
--> statement-breakpoint
INSERT INTO "role_permissions" ("role_id", "permission_id", "created_at")
SELECT '3346801f-45dc-4d40-b369-b6bef161de2d'::uuid, p.id, now()
FROM "permissions" p
WHERE p.name IN (
  'suppliers.read',
  'suppliers.create',
  'suppliers.update',
  'suppliers.delete',
  'rfqs.read',
  'rfqs.create',
  'rfqs.update'
)
ON CONFLICT ("role_id", "permission_id") DO NOTHING;
