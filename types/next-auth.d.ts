import type { DefaultSession } from 'next-auth';
import type { JWT as DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      roleId?: string;
      organizationId?: string;
      branchId?: string;
      loginAt?: string | null;
      lastLoginAt?: string | null;
      mustChangePassword?: boolean;
    };
    mustChangePassword?: boolean;
    loginAt?: string | null;
    lastLoginAt?: string | null;
  }

  interface User {
    roleId?: string;
    organizationId?: string;
    branchId?: string;
    loginAt?: string | null;
    lastLoginAt?: string | null;
    mustChangePassword?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    roleId?: string;
    organizationId?: string;
    branchId?: string;
    loginAt?: string | null;
    lastLoginAt?: string | null;
    mustChangePassword?: boolean;
  }
}
