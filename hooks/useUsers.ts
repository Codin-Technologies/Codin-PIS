import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    fetchUsers, 
    fetchUserById,
    createUser, 
    updateUser,
    deleteUser,
    fetchRoles, 
    fetchOrganizations, 
    fetchOrganizationById,
    fetchPermissions,
    fetchOrganizationTypes,
    createRole,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    CreateUserPayload,
    Role,
    Organization,
} from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';

export function useUsers() {
    return useQuery({
        queryKey: queryKeys.users(),
        queryFn: fetchUsers,
    });
}

export function useUser(id: string | null) {
    return useQuery({
        queryKey: queryKeys.user(id || ''),
        queryFn: async () => {
            if (!id) throw new Error('user id is required');
            return fetchUserById(id);
        },
        enabled: !!id,
    });
}

export function useRoles() {
    return useQuery({
        queryKey: queryKeys.roles(),
        queryFn: fetchRoles,
    });
}

export function usePermissions() {
    return useQuery({
        queryKey: queryKeys.permissions(),
        queryFn: fetchPermissions,
    });
}

export function useOrganizationTypes() {
    return useQuery({
        queryKey: queryKeys.organizationTypes(),
        queryFn: fetchOrganizationTypes,
    });
}

export function useOrganizations() {
    return useQuery({
        queryKey: queryKeys.organizations(),
        queryFn: fetchOrganizations,
    });
}

export function useOrganization(id: string | null) {
    return useQuery({
        queryKey: queryKeys.organization(id || ''),
        queryFn: async () => {
            if (!id) throw new Error('organization id is required');
            return fetchOrganizationById(id);
        },
        enabled: !!id,
    });
}

export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateUserPayload) => createUser(payload),
        meta: { errorTitle: 'Failed to create user' },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users() });
        },
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateUserPayload> }) => 
            updateUser(id, payload),
        meta: { errorTitle: 'Failed to update user' },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users() });
        },
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteUser(id),
        meta: { errorTitle: 'Failed to delete user' },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users() });
        },
    });
}

export function useCreateRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: Omit<Role, 'id' | 'createdAt'>) => createRole(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.roles() });
        },
    });
}

export function useCreateOrganization() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: Omit<Organization, 'id' | 'createdAt'>) => createOrganization(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.organizations() });
        },
    });
}

export function useUpdateOrganization() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<Omit<Organization, 'id' | 'createdAt' | 'organizationType' | 'users'>> }) => 
            updateOrganization(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.organizations() });
        },
    });
}

export function useDeleteOrganization() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteOrganization(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.organizations() });
        },
    });
}
