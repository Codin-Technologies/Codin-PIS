import { auth } from '@/app/auth';

export type AuthenticatedUser = {
  id: string;
  email: string;
  roleId?: string;
  organizationId?: string;
};

export type AuthenticatedError = {
  message: string;
};

/**
 * Checks the current Auth.js session
 * Returns the authenticated user or null if no session found.
 */
export const getAuthenticatedUser = async (
  _request?: Request
): Promise<AuthenticatedUser | AuthenticatedError | null> => {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;
    return {
      id: session.user.id,
      email: session.user.email ?? '',
      roleId: (session.user as any).roleId,
      organizationId: (session.user as any).organizationId,
    };
  } catch {
    return { message: 'Internal server error during authentication' };
  }
};
