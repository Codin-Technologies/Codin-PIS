import { db } from "@/lib/db";
import {
  users,
  rolePermissions,
  permissions,
  permissionGroups,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { AuthenticatedUser } from "@/lib/auth/utils";

/**
 * Checks whether the authenticated user has a given permission.
 *
 * Flow:
 *  1. Look up the user's roleId in the users table.
 *  2. Join role_permissions → permissions → permission_groups.
 *  3. Match the full permission name (e.g. 'users.create') and group name (e.g. 'users').
 *
 * Permission string format:  "groupName.action"  e.g. "roles.delete"
 */
export const hasPermission = async (
  user: AuthenticatedUser,
  requiredPermission: string, // e.g. "roles.read"
): Promise<boolean> => {
  if (!user?.id) return false;

  const [groupName] = requiredPermission.split(".");
  if (!groupName) return false;
  try {
    // 1 — fetch the user's role from the DB
    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.id),
    });
    if (!dbUser?.roleId) return false;

    // 2 — check whether that role has the requested permission
    const result = await db
      .select({ id: permissions.id })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(
        and(
          eq(rolePermissions.roleId, dbUser.roleId),
          eq(permissions.name, requiredPermission),
        ),
      )
      .limit(1);
    return result.length > 0;
  } catch (err) {
    console.error("[hasPermission] Error:", err);
    return false;
  }
};
