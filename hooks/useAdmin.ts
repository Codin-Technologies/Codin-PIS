import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    fetchOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    fetchOrganizationTypes,
    fetchPermissions,
    type User,
    type Role,
    type Organization,
} from '@/lib/api';

/**
 * useUsers — list and management
 */
export function useUsers() {
    const queryClient = useQueryClient();
    
    const query = useQuery({
        queryKey: queryKeys.users(),
        queryFn: fetchUsers,
    });

    const createMutation = useMutation({
        mutationFn: (payload: Omit<User, 'id' | 'createdAt'>) => createUser(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users() }),
    });

    return { ...query, createMutation };
}

/**
 * useRoles — role & permission management
 */
export function useRoles() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: queryKeys.roles(),
        queryFn: fetchRoles,
    });

    const permissionsQuery = useQuery({
        queryKey: queryKeys.permissions(),
        queryFn: fetchPermissions,
    });

    const createMutation = useMutation({
        mutationFn: (payload: Omit<Role, 'id' | 'createdAt'>) => createRole(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.roles() }),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteRole,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.roles() }),
    });

    return { ...query, permissions: permissionsQuery.data, createMutation, deleteMutation };
}

/**
 * useOrganizations — organization hierarchy and types
 */
export function useOrganizations() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: queryKeys.organizations(),
        queryFn: fetchOrganizations,
    });

    const typesQuery = useQuery({
        queryKey: queryKeys.organizationTypes(),
        queryFn: fetchOrganizationTypes,
    });

    const createMutation = useMutation({
        mutationFn: (payload: Omit<Organization, 'id' | 'createdAt'>) => createOrganization(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.organizations() }),
    });

    return { ...query, types: typesQuery.data, createMutation };
}
