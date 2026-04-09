INSERT INTO "permission_groups" ("id", "name", "description", "created_at")
VALUES
  ('11111111-1111-4111-8111-111111111105', 'departments', 'Inventory — departments', now())
ON CONFLICT ("name") DO NOTHING;
--> statement-breakpoint
INSERT INTO "permissions" ("name", "description", "group_id", "created_at")
SELECT 'departments.delete', 'Delete departments', g.id, now()
FROM "permission_groups" g
WHERE g.name = 'departments'
ON CONFLICT ("name") DO NOTHING;
--> statement-breakpoint
INSERT INTO "role_permissions" ("role_id", "permission_id", "created_at")
SELECT rp."role_id", p.id, now()
FROM "permissions" p
INNER JOIN "role_permissions" rp ON true
INNER JOIN "permissions" p_create ON p_create.id = rp."permission_id" AND p_create.name = 'departments.create'
WHERE p.name = 'departments.delete'
ON CONFLICT ("role_id", "permission_id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "role_permissions" ("role_id", "permission_id", "created_at")
SELECT '3346801f-45dc-4d40-b369-b6bef161de2d'::uuid, p.id, now()
FROM "permissions" p
WHERE p.name = 'departments.delete'
ON CONFLICT ("role_id", "permission_id") DO NOTHING;
